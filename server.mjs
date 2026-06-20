import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(__dirname, "public");
const dataDir = join(__dirname, "data");
const historyFile = join(dataDir, "history.json");
const jobsFile = join(dataDir, "jobs.json");
const port = Number(process.env.PORT || 4173);

const refreshMs = Number(process.env.REFRESH_MS || 10 * 60 * 1000);
const schedulerMs = Number(process.env.SCHEDULER_MS || 15 * 1000);
const maxConcurrentExecutions = Number(process.env.MAX_CONCURRENT_EXECUTIONS || 2);
const activeExecutions = new Map();

const azureRegions = (process.env.AZURE_REGIONS || "eastus,westus3,northcentralus,westeurope,uksouth,japaneast")
  .split(",")
  .map((region) => region.trim())
  .filter(Boolean);

const azureFamilies = (process.env.AZURE_FAMILIES || "NC,ND")
  .split(",")
  .map((family) => family.trim())
  .filter(Boolean);

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"]
]);

const state = {
  offers: [],
  history: [],
  jobs: [],
  sourceHealth: {},
  lastRefresh: null,
  refreshing: null
};

await mkdir(dataDir, { recursive: true });
state.history = await readJson(historyFile, []);
state.jobs = await readJson(jobsFile, []);
if (recoverInterruptedJobs()) await saveJson(jobsFile, state.jobs);

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function readJson(path, fallback) {
  try {
    if (!existsSync(path)) return fallback;
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

async function saveJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(payload)
  });
  res.end(payload);
}

function notFound(res) {
  json(res, 404, { error: "Not found" });
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const rawPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  if (rawPath.includes("..")) return notFound(res);

  const filePath = join(publicDir, rawPath);
  try {
    const file = await readFile(filePath);
    res.writeHead(200, {
      "content-type": mimeTypes.get(extname(filePath)) || "application/octet-stream",
      "cache-control": "no-store"
    });
    res.end(file);
  } catch {
    notFound(res);
  }
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/api/snapshot") {
    await refreshIfStale();
    json(res, 200, snapshot());
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/refresh") {
    await refreshPrices({ force: true });
    json(res, 200, snapshot());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/jobs") {
    json(res, 200, { jobs: state.jobs });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/executors") {
    json(res, 200, {
      executors: executorCatalog(),
      maxConcurrentExecutions,
      activeExecutions: activeExecutions.size
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/jobs") {
    const payload = JSON.parse((await readBody(req)) || "{}");
    const job = createJob(payload);
    state.jobs.unshift(job);
    await saveJson(jobsFile, state.jobs);
    await tickScheduler();
    json(res, 201, { job });
    return;
  }

  const cancelMatch = url.pathname.match(/^\/api\/jobs\/([^/]+)\/cancel$/);
  if (req.method === "POST" && cancelMatch) {
    const job = await cancelJob(decodeURIComponent(cancelMatch[1]));
    if (!job) return notFound(res);
    json(res, 200, { job });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/export.csv") {
    const rows = [
      "timestamp,provider,region,gpu,instance,price_usd_gpu_hour,price_usd_instance_hour,source_type",
      ...state.offers.map((offer) => [
        offer.timestamp,
        csv(offer.provider),
        csv(offer.region),
        csv(offer.gpu),
        csv(offer.instance),
        offer.priceUsdGpuHour,
        offer.priceUsdInstanceHour,
        offer.sourceType
      ].join(","))
    ];
    const payload = rows.join("\n");
    res.writeHead(200, {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=ai-compute-prices.csv"
    });
    res.end(payload);
    return;
  }

  notFound(res);
}

function csv(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function snapshot() {
  return {
    generatedAt: new Date().toISOString(),
    lastRefresh: state.lastRefresh,
    offers: state.offers,
    history: state.history.slice(-96),
    sourceHealth: state.sourceHealth,
    jobs: state.jobs.slice(0, 50),
    executors: executorCatalog(),
    activeExecutions: activeExecutions.size,
    maxConcurrentExecutions,
    recommendation: buildRecommendation(state.offers, state.history)
  };
}

function createJob(payload) {
  const now = new Date();
  const deadlineHours = clamp(Number(payload.deadlineHours || 6), 1, 168);
  const deadline = new Date(now.getTime() + deadlineHours * 60 * 60 * 1000);
  const maxPriceUsdGpuHour = clamp(Number(payload.maxPriceUsdGpuHour || 2), 0.01, 1000);
  const gpu = String(payload.gpu || "A100").trim();
  const executor = normalizeExecutor(payload.executor);
  const command = normalizeCommand(payload.command, executor);
  const retryLimit = clamp(Number(payload.retryLimit ?? 1), 0, 5);
  const timeoutSeconds = clamp(Number(payload.timeoutSeconds || 120), 1, 3600);

  return {
    id: `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    name: String(payload.name || "batch-job").trim().slice(0, 80),
    gpu,
    provider: String(payload.provider || "any"),
    region: String(payload.region || "any"),
    maxPriceUsdGpuHour,
    deadline: deadline.toISOString(),
    executor,
    command,
    retryLimit,
    timeoutSeconds,
    attempts: 0,
    status: "queued",
    createdAt: now.toISOString(),
    logs: [],
    events: [
      {
        at: now.toISOString(),
        type: "queued",
        message: `Waiting for ${gpu} at or below $${maxPriceUsdGpuHour.toFixed(2)}/GPU hour, then dispatch via ${executor}`
      }
    ]
  };
}

function executorCatalog() {
  return [
    {
      id: "dry-run",
      label: "Dry run",
      status: "ready",
      description: "Simulates dispatch without touching external infrastructure."
    },
    {
      id: "local",
      label: "Local command",
      status: "ready",
      description: "Runs a shell command on this machine after the price condition is met."
    },
    {
      id: "vast",
      label: "Vast.ai",
      status: process.env.VAST_API_KEY ? "configured" : "planned",
      description: "Connector slot for marketplace instance launch."
    },
    {
      id: "runpod",
      label: "RunPod",
      status: process.env.RUNPOD_API_KEY ? "configured" : "planned",
      description: "Connector slot for pod launch through RunPod APIs."
    }
  ];
}

function normalizeExecutor(value) {
  const executor = String(value || "dry-run").trim();
  return ["dry-run", "local", "vast", "runpod"].includes(executor) ? executor : "dry-run";
}

function normalizeCommand(value, executor) {
  const command = String(value || "").trim();
  if (executor === "local") {
    return command || "node -e \"console.log('AI Compute Weather local job ran at', new Date().toISOString())\"";
  }
  if (executor === "vast" || executor === "runpod") {
    return command || "connector launch placeholder";
  }
  return command || "dry-run dispatch";
}

function appendJobEvent(job, type, message, extra = {}) {
  job.events ||= [];
  job.events.unshift({
    at: new Date().toISOString(),
    type,
    message,
    ...extra
  });
  job.events = job.events.slice(0, 80);
}

function appendJobLog(job, stream, message) {
  job.logs ||= [];
  const clean = String(message || "").replace(/\s+$/g, "");
  if (!clean) return;
  for (const line of clean.split(/\r?\n/).filter(Boolean)) {
    job.logs.push({
      at: new Date().toISOString(),
      stream,
      message: line.slice(0, 800)
    });
  }
  job.logs = job.logs.slice(-160);
}

function recoverInterruptedJobs() {
  let changed = false;
  for (const job of state.jobs) {
    if (["dispatching", "running", "retrying"].includes(job.status)) {
      job.status = "failed";
      appendJobEvent(job, "interrupted", "Server restarted while the job was running");
      changed = true;
    }
  }
  return changed;
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

async function refreshIfStale() {
  const stale = !state.lastRefresh || Date.now() - Date.parse(state.lastRefresh) > refreshMs;
  if (stale) await refreshPrices();
}

async function refreshPrices({ force = false } = {}) {
  if (state.refreshing && !force) return state.refreshing;

  state.refreshing = (async () => {
    const timestamp = new Date().toISOString();
    const [azure, samples] = await Promise.all([
      fetchAzureSpotOffers(timestamp),
      Promise.resolve(sampleMarketplaceOffers(timestamp))
    ]);

    const offers = [...azure.offers, ...samples.offers]
      .sort((a, b) => a.priceUsdGpuHour - b.priceUsdGpuHour)
      .slice(0, 220);

    state.offers = offers;
    state.sourceHealth = {
      azure: azure.health,
      vast: samples.health.vast,
      runpod: samples.health.runpod,
      aws: samples.health.aws,
      gcp: samples.health.gcp
    };
    state.lastRefresh = timestamp;
    appendHistory(timestamp, offers);
    await saveJson(historyFile, state.history.slice(-288));
    await tickScheduler();
  })();

  try {
    await state.refreshing;
  } finally {
    state.refreshing = null;
  }
}

function appendHistory(timestamp, offers) {
  const liveOffers = offers.filter((offer) => offer.sourceType === "live");
  const cheapestLive = liveOffers[0]?.priceUsdGpuHour ?? null;
  const cheapestAny = offers[0]?.priceUsdGpuHour ?? null;
  const a100 = cheapestForGpu(offers, "A100")?.priceUsdGpuHour ?? null;
  const h100 = cheapestForGpu(offers, "H100")?.priceUsdGpuHour ?? null;
  const h200 = cheapestForGpu(offers, "H200")?.priceUsdGpuHour ?? null;

  state.history.push({
    timestamp,
    cheapestLive,
    cheapestAny,
    a100,
    h100,
    h200,
    offerCount: offers.length
  });
  state.history = state.history.slice(-288);
}

async function fetchAzureSpotOffers(timestamp) {
  const started = Date.now();
  const offers = [];
  const errors = [];
  const requests = [];

  for (const region of azureRegions) {
    for (const family of azureFamilies) {
      requests.push(fetchAzureFamily(region, family, timestamp).catch((error) => {
        errors.push(`${region}/${family}: ${error.message}`);
        return [];
      }));
    }
  }

  for (const batch of chunk(requests, 4)) {
    const results = await Promise.all(batch);
    offers.push(...results.flat());
  }

  return {
    offers: dedupeCheapest(offers),
    health: {
      status: offers.length ? "live" : "degraded",
      label: offers.length ? "Azure Retail Prices API" : "Azure API unavailable",
      offers: offers.length,
      latencyMs: Date.now() - started,
      errors: errors.slice(0, 4)
    }
  };
}

async function fetchAzureFamily(region, family, timestamp) {
  const filter = [
    "serviceName eq 'Virtual Machines'",
    `armRegionName eq '${region}'`,
    "contains(meterName, 'Spot')",
    `contains(skuName, '${family}')`
  ].join(" and ");

  let url = `https://prices.azure.com/api/retail/prices?$filter=${encodeURIComponent(filter)}`;
  const items = [];
  for (let page = 0; page < 3 && url; page += 1) {
    const response = await fetch(url, { signal: AbortSignal.timeout(9000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    items.push(...(data.Items || []));
    url = data.NextPageLink || null;
  }

  return items
    .filter((item) => item.currencyCode === "USD")
    .filter((item) => item.type === "Consumption")
    .filter((item) => Number(item.retailPrice) > 0)
    .filter((item) => item.isPrimaryMeterRegion !== false)
    .map((item) => normalizeAzureOffer(item, timestamp))
    .filter(Boolean);
}

function normalizeAzureOffer(item, timestamp) {
  const instance = item.armSkuName || item.skuName || item.meterName;
  const gpu = detectGpu(instance, item.productName, item.meterName);
  if (!gpu) return null;

  const gpuCount = inferGpuCount(instance, gpu);
  const priceUsdInstanceHour = Number(item.retailPrice);
  const priceUsdGpuHour = priceUsdInstanceHour / gpuCount;

  return {
    id: `azure:${item.armRegionName}:${instance}:${item.meterId}`,
    provider: "Azure",
    region: item.armRegionName,
    location: item.location,
    gpu,
    gpuCount,
    instance,
    priceUsdGpuHour: round(priceUsdGpuHour, 4),
    priceUsdInstanceHour: round(priceUsdInstanceHour, 4),
    interruptible: true,
    sourceType: "live",
    sourceLabel: "Retail Prices API",
    reliability: "medium",
    effectiveStartDate: item.effectiveStartDate,
    timestamp
  };
}

function detectGpu(...parts) {
  const text = parts.filter(Boolean).join(" ").toUpperCase();
  if (text.includes("H200")) return "H200";
  if (text.includes("H100")) return "H100";
  if (text.includes("A100")) return "A100";
  if (text.includes("L40S")) return "L40S";
  if (text.includes("A10")) return "A10";
  if (text.includes("T4")) return "T4";
  if (text.includes("V100")) return "V100";
  if (text.includes("RTXPRO6000") || text.includes("RTX6K") || text.includes("RTX 6000")) return "RTX 6000";
  return null;
}

function inferGpuCount(instance, gpu) {
  const text = String(instance || "").toUpperCase();
  if (/ND96.*(A100|H100|H200)/.test(text)) return 8;
  if (/ND40.*A100/.test(text)) return 8;
  const nc = text.match(/NC(\d+)/);
  if (nc) {
    const vcpu = Number(nc[1]);
    if (gpu === "RTX 6000") return clamp(Math.round(vcpu / 40), 1, 8);
    if (gpu === "T4") return clamp(Math.round(vcpu / 16), 1, 4);
    return clamp(Math.round(vcpu / 24), 1, 8);
  }
  return 1;
}

function sampleMarketplaceOffers(timestamp) {
  const t = Date.parse(timestamp) / 3_600_000;
  const catalog = [
    ["Vast.ai", "global", "RTX 6000", "market-rtx6000", 0.45, 0.20, "proxy"],
    ["Vast.ai", "global", "A100", "market-a100-80gb", 1.58, 0.26, "proxy"],
    ["Vast.ai", "global", "H100", "market-h100", 2.72, 0.22, "proxy"],
    ["RunPod", "US", "A100", "secure-a100-80gb", 1.89, 0.12, "proxy"],
    ["RunPod", "US", "H100", "secure-h100", 3.19, 0.13, "proxy"],
    ["AWS Spot", "us-east-1", "A100", "p4d.24xlarge", 2.65, 0.18, "proxy"],
    ["AWS Spot", "us-west-2", "H100", "p5.48xlarge", 5.95, 0.24, "proxy"],
    ["GCP Spot", "us-central1", "A100", "a2-highgpu-1g", 2.05, 0.16, "proxy"],
    ["GCP Spot", "us-east5", "H100", "a3-highgpu-1g", 4.25, 0.19, "proxy"]
  ];

  const offers = catalog.map(([provider, region, gpu, instance, base, swing, sourceType], index) => {
    const wave = Math.sin(t / 2 + index * 1.73) * 0.65 + Math.cos(t / 5 + index) * 0.35;
    const priceUsdGpuHour = Math.max(0.08, base * (1 + swing * wave));
    return {
      id: `${provider}:${region}:${gpu}:${instance}`,
      provider,
      region,
      location: region,
      gpu,
      gpuCount: 1,
      instance,
      priceUsdGpuHour: round(priceUsdGpuHour, 4),
      priceUsdInstanceHour: round(priceUsdGpuHour, 4),
      interruptible: true,
      sourceType,
      sourceLabel: "Synthetic connector placeholder",
      reliability: "low",
      timestamp
    };
  });

  return {
    offers,
    health: {
      vast: optionalConnectorHealth("VAST_API_KEY", "simulated", "Add VAST_API_KEY for live marketplace offers"),
      runpod: optionalConnectorHealth("RUNPOD_API_KEY", "simulated", "Add RUNPOD_API_KEY for live GraphQL prices"),
      aws: optionalConnectorHealth("AWS_PROFILE", "simulated", "Add AWS credentials for spot history"),
      gcp: optionalConnectorHealth("GOOGLE_APPLICATION_CREDENTIALS", "simulated", "Add Google billing credentials")
    }
  };
}

function optionalConnectorHealth(envName, status, label) {
  return {
    status: process.env[envName] ? "configured" : status,
    label: process.env[envName] ? `${envName} detected` : label,
    offers: 0,
    latencyMs: 0,
    errors: []
  };
}

function dedupeCheapest(offers) {
  const best = new Map();
  for (const offer of offers) {
    const key = `${offer.provider}:${offer.region}:${offer.instance}:${offer.gpu}`;
    const current = best.get(key);
    if (!current || offer.priceUsdGpuHour < current.priceUsdGpuHour) best.set(key, offer);
  }
  return [...best.values()];
}

function chunk(values, size) {
  const chunks = [];
  for (let index = 0; index < values.length; index += size) chunks.push(values.slice(index, index + size));
  return chunks;
}

function round(value, places) {
  const multiplier = 10 ** places;
  return Math.round(value * multiplier) / multiplier;
}

function cheapestForGpu(offers, gpu) {
  return offers
    .filter((offer) => offer.gpu === gpu)
    .sort((a, b) => a.priceUsdGpuHour - b.priceUsdGpuHour)[0] || null;
}

function buildRecommendation(offers, history) {
  const cheapest = offers[0] || null;
  if (!cheapest) {
    return {
      action: "wait",
      label: "No market data",
      detail: "Collectors have not returned offers yet."
    };
  }

  const recent = history
    .slice(-48)
    .map((point) => point.cheapestAny)
    .filter((value) => Number.isFinite(value));
  const average = recent.length ? recent.reduce((sum, value) => sum + value, 0) / recent.length : cheapest.priceUsdGpuHour;
  const ratio = cheapest.priceUsdGpuHour / average;

  if (ratio <= 0.9) {
    return {
      action: "run",
      label: "Run now",
      detail: `${cheapest.provider} ${cheapest.gpu} is ${Math.round((1 - ratio) * 100)}% below the recent average.`,
      offerId: cheapest.id
    };
  }

  if (ratio >= 1.1) {
    return {
      action: "defer",
      label: "Defer",
      detail: `Current cheapest price is ${Math.round((ratio - 1) * 100)}% above the recent average.`,
      offerId: cheapest.id
    };
  }

  return {
    action: "watch",
    label: "Watch",
    detail: "Prices are close to the recent average.",
    offerId: cheapest.id
  };
}

async function tickScheduler() {
  const now = Date.now();
  let changed = false;

  for (const job of state.jobs) {
    if (job.status !== "queued") continue;
    if (job.nextRetryAt && Date.parse(job.nextRetryAt) > now) continue;
    if (activeExecutions.size >= maxConcurrentExecutions) {
      if (job.lastCapacityEventAt !== new Date(now).toISOString().slice(0, 16)) {
        job.lastCapacityEventAt = new Date(now).toISOString().slice(0, 16);
        appendJobEvent(job, "capacity", `Waiting for an execution slot (${activeExecutions.size}/${maxConcurrentExecutions} active)`);
        changed = true;
      }
      continue;
    }

    const matchingOffers = state.offers
      .filter((offer) => job.gpu === "any" || offer.gpu === job.gpu)
      .filter((offer) => job.provider === "any" || offer.provider === job.provider)
      .filter((offer) => job.region === "any" || offer.region === job.region)
      .sort((a, b) => a.priceUsdGpuHour - b.priceUsdGpuHour);

    const best = matchingOffers[0];
    const deadlineMs = Date.parse(job.deadline);
    const deadlineClose = deadlineMs - now < 20 * 60 * 1000;

    if (best && (best.priceUsdGpuHour <= job.maxPriceUsdGpuHour || deadlineClose)) {
      await startExecution(job, best, { deadlineClose });
      changed = true;
    } else if (deadlineMs < now) {
      job.status = "expired";
      appendJobEvent(job, "expired", "Deadline passed before a matching price appeared");
      changed = true;
    }
  }

  if (changed) await saveJson(jobsFile, state.jobs);
}

async function startExecution(job, offer, { deadlineClose = false } = {}) {
  if (activeExecutions.has(job.id)) return;
  job.status = "dispatching";
  job.selectedOffer = offer;
  job.attempts = Number(job.attempts || 0) + 1;
  job.startedAt ||= new Date().toISOString();
  job.lastAttemptAt = new Date().toISOString();
  delete job.nextRetryAt;
  appendJobEvent(
    job,
    "dispatching",
    `${deadlineClose ? "Deadline window reached; dispatching" : "Price condition met"} on ${offer.provider} ${offer.gpu} at $${offer.priceUsdGpuHour.toFixed(2)}/GPU hour`
  );
  await saveJson(jobsFile, state.jobs);

  if (job.executor === "local") {
    runLocalJob(job);
    return;
  }

  if (job.executor === "vast" || job.executor === "runpod") {
    runConnectorPlaceholder(job);
    return;
  }

  runDryRunJob(job);
}

function runDryRunJob(job) {
  job.status = "running";
  appendJobEvent(job, "started", "Dry-run executor started");
  appendJobLog(job, "system", `Selected ${job.selectedOffer.provider} ${job.selectedOffer.instance} at $${job.selectedOffer.priceUsdGpuHour}/GPU hour`);
  const timer = setTimeout(() => {
    activeExecutions.delete(job.id);
    completeJob(job, { message: "Dry-run dispatch completed", exitCode: 0 }).catch(() => {});
  }, 4500);
  activeExecutions.set(job.id, { type: "dry-run", timer });
  saveJson(jobsFile, state.jobs).catch(() => {});
}

function runConnectorPlaceholder(job) {
  job.status = "running";
  appendJobEvent(job, "started", `${job.executor} connector placeholder started`);
  appendJobLog(job, "system", `${job.executor} API credentials are not wired to launch instances yet.`);
  const timer = setTimeout(() => {
    activeExecutions.delete(job.id);
    failOrRetryJob(job, `${job.executor} connector is planned but not implemented`, { exitCode: 78 }).catch(() => {});
  }, 2500);
  activeExecutions.set(job.id, { type: job.executor, timer });
  saveJson(jobsFile, state.jobs).catch(() => {});
}

function runLocalJob(job) {
  job.status = "running";
  appendJobEvent(job, "started", "Local command executor started");
  appendJobLog(job, "system", `Command: ${job.command}`);

  const child = spawn("/bin/zsh", ["-lc", job.command], {
    cwd: __dirname,
    env: {
      ...process.env,
      AI_COMPUTE_JOB_ID: job.id,
      AI_COMPUTE_PROVIDER: job.selectedOffer?.provider || "",
      AI_COMPUTE_REGION: job.selectedOffer?.region || "",
      AI_COMPUTE_GPU: job.selectedOffer?.gpu || "",
      AI_COMPUTE_PRICE_USD_GPU_HOUR: String(job.selectedOffer?.priceUsdGpuHour ?? "")
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  const timeoutMs = Number(job.timeoutSeconds || 120) * 1000;
  const timeout = setTimeout(() => {
    appendJobLog(job, "system", `Timeout after ${job.timeoutSeconds}s; terminating process`);
    child.kill("SIGTERM");
    setTimeout(() => {
      if (!child.killed) child.kill("SIGKILL");
    }, 3000).unref();
  }, timeoutMs);

  activeExecutions.set(job.id, { type: "local", child, timeout });

  child.stdout.on("data", (chunk) => {
    appendJobLog(job, "stdout", chunk.toString());
    saveJson(jobsFile, state.jobs).catch(() => {});
  });

  child.stderr.on("data", (chunk) => {
    appendJobLog(job, "stderr", chunk.toString());
    saveJson(jobsFile, state.jobs).catch(() => {});
  });

  child.on("error", (error) => {
    clearTimeout(timeout);
    activeExecutions.delete(job.id);
    if (job.status === "canceled") return;
    failOrRetryJob(job, error.message, { exitCode: 127 }).catch(() => {});
  });

  child.on("close", (code, signal) => {
    clearTimeout(timeout);
    activeExecutions.delete(job.id);
    if (job.status === "canceled") return;
    if (code === 0) {
      completeJob(job, { message: "Local command completed", exitCode: code }).catch(() => {});
      return;
    }
    const detail = signal ? `Process exited with signal ${signal}` : `Process exited with code ${code}`;
    failOrRetryJob(job, detail, { exitCode: code ?? 1, signal }).catch(() => {});
  });

  saveJson(jobsFile, state.jobs).catch(() => {});
}

async function completeJob(job, { message, exitCode }) {
  if (!job || !["running", "dispatching"].includes(job.status)) return;
  job.status = "complete";
  job.completedAt = new Date().toISOString();
  job.exitCode = exitCode;
  appendJobEvent(job, "complete", message);
  await saveJson(jobsFile, state.jobs);
}

async function failOrRetryJob(job, reason, { exitCode, signal } = {}) {
  if (!job) return;
  if (["complete", "canceled", "expired"].includes(job.status)) return;
  job.exitCode = exitCode;
  if (signal) job.signal = signal;
  appendJobLog(job, "system", reason);

  if (Number(job.attempts || 0) <= Number(job.retryLimit || 0)) {
    job.status = "queued";
    job.nextRetryAt = new Date(Date.now() + 15_000).toISOString();
    appendJobEvent(job, "retry", `${reason}; retrying when a matching cheap offer is available`);
  } else {
    job.status = "failed";
    job.completedAt = new Date().toISOString();
    appendJobEvent(job, "failed", reason);
  }

  await saveJson(jobsFile, state.jobs);
}

async function cancelJob(id) {
  const job = state.jobs.find((item) => item.id === id);
  if (!job) return null;

  const active = activeExecutions.get(id);
  if (active?.child) active.child.kill("SIGTERM");
  if (active?.timer) clearTimeout(active.timer);
  if (active?.timeout) clearTimeout(active.timeout);
  activeExecutions.delete(id);

  if (!["complete", "failed", "expired", "canceled"].includes(job.status)) {
    job.status = "canceled";
    job.completedAt = new Date().toISOString();
    appendJobEvent(job, "canceled", "Job canceled by user");
    await saveJson(jobsFile, state.jobs);
  }

  return job;
}

const server = createServer(async (req, res) => {
  try {
    if (req.url.startsWith("/api/")) {
      await handleApi(req, res);
    } else {
      await serveStatic(req, res);
    }
  } catch (error) {
    json(res, 500, { error: error.message });
  }
});

await refreshPrices();
setInterval(() => refreshPrices().catch(() => {}), refreshMs).unref();
setInterval(() => tickScheduler().catch(() => {}), schedulerMs).unref();

server.listen(port, () => {
  console.log(`AI Compute Weather running at http://localhost:${port}`);
});
