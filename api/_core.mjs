const refreshMs = Number(process.env.REFRESH_MS || 10 * 60 * 1000);
const azureRegions = (process.env.AZURE_REGIONS || "eastus,westus3,northcentralus,westeurope,uksouth,japaneast")
  .split(",")
  .map((region) => region.trim())
  .filter(Boolean);
const azureFamilies = (process.env.AZURE_FAMILIES || "NC,ND")
  .split(",")
  .map((family) => family.trim())
  .filter(Boolean);

const store = globalThis.__AI_COMPUTE_WEATHER_STORE__ ||= {
  offers: [],
  history: [],
  jobs: [],
  sourceHealth: {},
  lastRefresh: null,
  refreshing: null
};

export function json(res, status, body) {
  res.status(status).setHeader("cache-control", "no-store");
  res.json(body);
}

export async function getSnapshot({ force = false } = {}) {
  await refreshIfStale(force);
  return {
    generatedAt: new Date().toISOString(),
    lastRefresh: store.lastRefresh,
    offers: store.offers,
    history: store.history.slice(-96),
    sourceHealth: store.sourceHealth,
    jobs: store.jobs.slice(0, 50),
    executors: executorCatalog(),
    activeExecutions: 0,
    maxConcurrentExecutions: 1,
    recommendation: buildRecommendation(store.offers, store.history)
  };
}

export async function getJobs() {
  return store.jobs;
}

export async function createJob(payload = {}) {
  await refreshIfStale(false);
  const now = new Date();
  const deadlineHours = clamp(Number(payload.deadlineHours || 6), 1, 168);
  const deadline = new Date(now.getTime() + deadlineHours * 60 * 60 * 1000);
  const maxPriceUsdGpuHour = clamp(Number(payload.maxPriceUsdGpuHour || 2), 0.01, 1000);
  const gpu = String(payload.gpu || "A100").trim();
  const executor = normalizeExecutor(payload.executor);
  const command = String(payload.command || "dry-run dispatch").trim();
  const retryLimit = clamp(Number(payload.retryLimit ?? 1), 0, 5);
  const timeoutSeconds = clamp(Number(payload.timeoutSeconds || 120), 1, 3600);

  const job = {
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

  store.jobs.unshift(job);
  await tickServerlessScheduler();
  return job;
}

export async function cancelJob(id) {
  const job = store.jobs.find((item) => item.id === id);
  if (!job) return null;
  if (!["complete", "failed", "expired", "canceled"].includes(job.status)) {
    job.status = "canceled";
    job.completedAt = new Date().toISOString();
    appendJobEvent(job, "canceled", "Job canceled by user");
  }
  return job;
}

export function executorCatalog() {
  return [
    {
      id: "dry-run",
      label: "Dry run",
      status: "ready",
      description: "Simulates dispatch in the Vercel serverless deployment."
    },
    {
      id: "local",
      label: "Local command",
      status: "local-only",
      description: "Available when running npm start locally; blocked on Vercel."
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

export function toCsv() {
  const rows = [
    "timestamp,provider,region,gpu,instance,price_usd_gpu_hour,price_usd_instance_hour,source_type",
    ...store.offers.map((offer) => [
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
  return rows.join("\n");
}

async function refreshIfStale(force) {
  const stale = !store.lastRefresh || Date.now() - Date.parse(store.lastRefresh) > refreshMs;
  if (!force && !stale) return;
  if (store.refreshing && !force) return store.refreshing;

  store.refreshing = refreshPrices();
  try {
    await store.refreshing;
  } finally {
    store.refreshing = null;
  }
}

async function refreshPrices() {
  const timestamp = new Date().toISOString();
  const [azure, samples] = await Promise.all([
    fetchAzureSpotOffers(timestamp),
    Promise.resolve(sampleMarketplaceOffers(timestamp))
  ]);
  const offers = [...azure.offers, ...samples.offers]
    .sort((a, b) => a.priceUsdGpuHour - b.priceUsdGpuHour)
    .slice(0, 220);

  store.offers = offers;
  store.sourceHealth = {
    azure: azure.health,
    vast: samples.health.vast,
    runpod: samples.health.runpod,
    aws: samples.health.aws,
    gcp: samples.health.gcp
  };
  store.lastRefresh = timestamp;
  appendHistory(timestamp, offers);
  await tickServerlessScheduler();
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

async function tickServerlessScheduler() {
  const now = Date.now();
  for (const job of store.jobs) {
    if (job.status !== "queued") continue;
    const matchingOffers = store.offers
      .filter((offer) => job.gpu === "any" || offer.gpu === job.gpu)
      .filter((offer) => job.provider === "any" || offer.provider === job.provider)
      .filter((offer) => job.region === "any" || offer.region === job.region)
      .sort((a, b) => a.priceUsdGpuHour - b.priceUsdGpuHour);

    const best = matchingOffers[0];
    const deadlineMs = Date.parse(job.deadline);
    const deadlineClose = deadlineMs - now < 20 * 60 * 1000;

    if (best && (best.priceUsdGpuHour <= job.maxPriceUsdGpuHour || deadlineClose)) {
      runServerlessJob(job, best, deadlineClose);
    } else if (deadlineMs < now) {
      job.status = "expired";
      appendJobEvent(job, "expired", "Deadline passed before a matching price appeared");
    }
  }
}

function runServerlessJob(job, offer, deadlineClose) {
  job.selectedOffer = offer;
  job.attempts = Number(job.attempts || 0) + 1;
  job.startedAt ||= new Date().toISOString();
  job.lastAttemptAt = new Date().toISOString();
  appendJobEvent(
    job,
    "dispatching",
    `${deadlineClose ? "Deadline window reached; dispatching" : "Price condition met"} on ${offer.provider} ${offer.gpu} at $${offer.priceUsdGpuHour.toFixed(2)}/GPU hour`
  );

  if (job.executor !== "dry-run") {
    job.status = "failed";
    job.completedAt = new Date().toISOString();
    job.exitCode = 78;
    appendJobLog(job, "system", `${job.executor} executor is not available in the Vercel serverless demo. Use npm start locally for local commands.`);
    appendJobEvent(job, "failed", `${job.executor} executor is not available in the Vercel deployment`);
    return;
  }

  job.status = "complete";
  job.completedAt = new Date().toISOString();
  job.exitCode = 0;
  appendJobLog(job, "system", `Selected ${offer.provider} ${offer.instance} at $${offer.priceUsdGpuHour}/GPU hour`);
  appendJobEvent(job, "complete", "Dry-run dispatch completed in Vercel serverless mode");
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

function appendHistory(timestamp, offers) {
  const liveOffers = offers.filter((offer) => offer.sourceType === "live");
  store.history.push({
    timestamp,
    cheapestLive: liveOffers[0]?.priceUsdGpuHour ?? null,
    cheapestAny: offers[0]?.priceUsdGpuHour ?? null,
    a100: cheapestForGpu(offers, "A100")?.priceUsdGpuHour ?? null,
    h100: cheapestForGpu(offers, "H100")?.priceUsdGpuHour ?? null,
    h200: cheapestForGpu(offers, "H200")?.priceUsdGpuHour ?? null,
    offerCount: offers.length
  });
  store.history = store.history.slice(-288);
}

function appendJobEvent(job, type, message) {
  job.events ||= [];
  job.events.unshift({ at: new Date().toISOString(), type, message });
  job.events = job.events.slice(0, 80);
}

function appendJobLog(job, stream, message) {
  job.logs ||= [];
  for (const line of String(message || "").split(/\r?\n/).filter(Boolean)) {
    job.logs.push({ at: new Date().toISOString(), stream, message: line.slice(0, 800) });
  }
  job.logs = job.logs.slice(-160);
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

function optionalConnectorHealth(envName, status, label) {
  return {
    status: process.env[envName] ? "configured" : status,
    label: process.env[envName] ? `${envName} detected` : label,
    offers: 0,
    latencyMs: 0,
    errors: []
  };
}

function normalizeExecutor(value) {
  const executor = String(value || "dry-run").trim();
  return ["dry-run", "local", "vast", "runpod"].includes(executor) ? executor : "dry-run";
}

function cheapestForGpu(offers, gpu) {
  return offers
    .filter((offer) => offer.gpu === gpu)
    .sort((a, b) => a.priceUsdGpuHour - b.priceUsdGpuHour)[0] || null;
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

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function csv(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}
