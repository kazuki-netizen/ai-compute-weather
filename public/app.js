const state = {
  snapshot: null,
  gpuFilter: "all",
  providerFilter: "all"
};

const $ = (selector) => document.querySelector(selector);

const elements = {
  refreshButton: $("#refreshButton"),
  cheapestMetric: $("#cheapestMetric"),
  cheapestSub: $("#cheapestSub"),
  signalMetric: $("#signalMetric"),
  signalSub: $("#signalSub"),
  liveMetric: $("#liveMetric"),
  sourceSub: $("#sourceSub"),
  queueMetric: $("#queueMetric"),
  queueSub: $("#queueSub"),
  gpuFilter: $("#gpuFilter"),
  providerFilter: $("#providerFilter"),
  jobGpu: $("#jobGpu"),
  offerRows: $("#offerRows"),
  decisionTitle: $("#decisionTitle"),
  decisionDetail: $("#decisionDetail"),
  updatedAt: $("#updatedAt"),
  priceChart: $("#priceChart"),
  jobForm: $("#jobForm"),
  jobList: $("#jobList"),
  sources: $("#sources")
};

elements.refreshButton.addEventListener("click", async () => {
  elements.refreshButton.disabled = true;
  try {
    await loadSnapshot("/api/refresh", { method: "POST" });
  } finally {
    elements.refreshButton.disabled = false;
  }
});

elements.gpuFilter.addEventListener("change", () => {
  state.gpuFilter = elements.gpuFilter.value;
  render();
});

elements.providerFilter.addEventListener("change", () => {
  state.providerFilter = elements.providerFilter.value;
  render();
});

elements.jobForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(elements.jobForm);
  const payload = Object.fromEntries(form.entries());
  payload.maxPriceUsdGpuHour = Number(payload.maxPriceUsdGpuHour);
  payload.deadlineHours = Number(payload.deadlineHours);
  payload.retryLimit = Number(payload.retryLimit);
  payload.timeoutSeconds = Number(payload.timeoutSeconds);

  await fetch("/api/jobs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  await loadSnapshot();
});

elements.jobList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-cancel-job]");
  if (!button) return;
  button.disabled = true;
  await fetch(`/api/jobs/${encodeURIComponent(button.dataset.cancelJob)}/cancel`, { method: "POST" });
  await loadSnapshot();
});

await loadSnapshot();
setInterval(() => loadSnapshot().catch(() => {}), 30_000);

async function loadSnapshot(url = "/api/snapshot", options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  state.snapshot = await response.json();
  syncFilters();
  render();
}

function syncFilters() {
  const offers = state.snapshot?.offers || [];
  const gpuValues = ["all", ...unique(offers.map((offer) => offer.gpu))];
  const providerValues = ["all", ...unique(offers.map((offer) => offer.provider))];

  fillSelect(elements.gpuFilter, gpuValues, state.gpuFilter);
  fillSelect(elements.providerFilter, providerValues, state.providerFilter);
  fillSelect(elements.jobGpu, unique(offers.map((offer) => offer.gpu)), elements.jobGpu.value || "A100");
}

function fillSelect(select, values, selected) {
  const current = values.includes(selected) ? selected : values[0];
  select.innerHTML = values.map((value) => {
    const label = value === "all" ? "All" : value;
    return `<option value="${escapeHtml(value)}"${value === current ? " selected" : ""}>${escapeHtml(label)}</option>`;
  }).join("");
}

function render() {
  const snapshot = state.snapshot;
  if (!snapshot) return;

  const offers = snapshot.offers || [];
  const filtered = offers
    .filter((offer) => state.gpuFilter === "all" || offer.gpu === state.gpuFilter)
    .filter((offer) => state.providerFilter === "all" || offer.provider === state.providerFilter);
  const cheapest = filtered[0] || offers[0];
  const liveOffers = offers.filter((offer) => offer.sourceType === "live");
  const queued = snapshot.jobs.filter((job) => job.status === "queued").length;
  const running = snapshot.jobs.filter((job) => job.status === "running").length;

  elements.cheapestMetric.textContent = cheapest ? money(cheapest.priceUsdGpuHour) : "$--";
  elements.cheapestSub.textContent = cheapest ? `${cheapest.provider} ${cheapest.gpu} ${cheapest.region}` : "--";
  elements.signalMetric.textContent = snapshot.recommendation?.label || "--";
  elements.signalSub.textContent = snapshot.recommendation?.action || "--";
  elements.liveMetric.textContent = String(liveOffers.length);
  elements.sourceSub.textContent = `${offers.length} total offers`;
  elements.queueMetric.textContent = String(queued);
  elements.queueSub.textContent = `${running} running`;
  elements.updatedAt.textContent = snapshot.lastRefresh ? new Date(snapshot.lastRefresh).toLocaleTimeString() : "--";

  elements.decisionTitle.textContent = snapshot.recommendation?.label || "--";
  elements.decisionDetail.textContent = snapshot.recommendation?.detail || "--";

  renderRows(filtered.slice(0, 80));
  renderJobs(snapshot.jobs);
  renderSources(snapshot.sourceHealth);
  drawChart(snapshot.history || []);
}

function renderRows(offers) {
  elements.offerRows.innerHTML = offers.map((offer) => `
    <tr>
      <td title="${escapeHtml(offer.provider)}">${escapeHtml(offer.provider)}</td>
      <td>${escapeHtml(offer.gpu)} x${offer.gpuCount}</td>
      <td title="${escapeHtml(offer.location || offer.region)}">${escapeHtml(offer.region)}</td>
      <td title="${escapeHtml(offer.instance)}">${escapeHtml(offer.instance)}</td>
      <td class="price">${money(offer.priceUsdGpuHour)}</td>
      <td><span class="badge ${offer.sourceType === "proxy" ? "proxy" : ""}">${escapeHtml(offer.sourceType)}</span></td>
    </tr>
  `).join("");
}

function renderJobs(jobs) {
  if (!jobs.length) {
    elements.jobList.innerHTML = `<div class="job-item"><div class="job-meta">No queued jobs</div></div>`;
    return;
  }

  elements.jobList.innerHTML = jobs.slice(0, 20).map((job) => `
    <article class="job-item">
      <div class="job-main">
        <div class="job-name" title="${escapeHtml(job.name)}">${escapeHtml(job.name)}</div>
        <span class="status ${escapeHtml(job.status)}">${escapeHtml(job.status)}</span>
      </div>
      <div class="job-meta">
        ${escapeHtml(job.gpu)} below ${money(job.maxPriceUsdGpuHour)} by ${new Date(job.deadline).toLocaleString()}
      </div>
      <div class="job-meta">
        ${escapeHtml(job.executor || "dry-run")} · attempt ${Number(job.attempts || 0)}/${Number(job.retryLimit || 0) + 1}${job.selectedOffer ? ` · ${escapeHtml(job.selectedOffer.provider)} ${escapeHtml(job.selectedOffer.region)} ${money(job.selectedOffer.priceUsdGpuHour)}` : ""}
      </div>
      <div class="job-meta">${escapeHtml(job.events?.[0]?.message || "")}</div>
      ${job.logs?.length ? `<div class="job-log">${job.logs.slice(-3).map((log) => `<div class="log-line ${escapeHtml(log.stream)}"><span>${escapeHtml(log.stream)}</span>${escapeHtml(log.message)}</div>`).join("")}</div>` : ""}
      ${["queued", "dispatching", "running", "retrying"].includes(job.status) ? `<div class="job-actions"><button class="button secondary mini" type="button" data-cancel-job="${escapeHtml(job.id)}">Cancel</button></div>` : ""}
    </article>
  `).join("");
}

function renderSources(sourceHealth = {}) {
  elements.sources.innerHTML = Object.entries(sourceHealth).map(([name, health]) => `
    <article>
      <h3><span class="live-dot ${escapeHtml(health.status)}"></span>${escapeHtml(labelCase(name))}</h3>
      <p>${escapeHtml(health.status)} · ${Number(health.offers || 0)} offers · ${Number(health.latencyMs || 0)} ms</p>
      <p>${escapeHtml(health.label || "")}</p>
    </article>
  `).join("");
}

function drawChart(history) {
  const canvas = elements.priceChart;
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.max(1, Math.floor(width * ratio));
  canvas.height = Math.max(1, Math.floor(height * ratio));
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, width, height);

  const pad = { left: 50, right: 18, top: 18, bottom: 34 };
  const values = history.map((point) => point.cheapestAny).filter((value) => Number.isFinite(value));
  if (values.length < 2) {
    ctx.fillStyle = "#64748d";
    ctx.font = "14px Inter, sans-serif";
    ctx.fillText("Waiting for price samples", pad.left, height / 2);
    return;
  }

  const min = Math.min(...values) * 0.92;
  const max = Math.max(...values) * 1.08;
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  ctx.strokeStyle = "#e3e8ee";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = pad.top + (plotH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#64748d";
  ctx.font = "12px Inter, sans-serif";
  ctx.textAlign = "right";
  for (let i = 0; i <= 4; i += 1) {
    const value = max - ((max - min) / 4) * i;
    const y = pad.top + (plotH / 4) * i + 4;
    ctx.fillText(`$${value.toFixed(2)}`, pad.left - 8, y);
  }

  const points = history
    .map((point, index) => ({ value: point.cheapestAny, index }))
    .filter((point) => Number.isFinite(point.value));

  ctx.strokeStyle = "#533afd";
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((point, i) => {
    const x = pad.left + (plotW * point.index) / Math.max(1, history.length - 1);
    const y = pad.top + plotH - ((point.value - min) / (max - min || 1)) * plotH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  const last = points[points.length - 1];
  const x = pad.left + (plotW * last.index) / Math.max(1, history.length - 1);
  const y = pad.top + plotH - ((last.value - min) / (max - min || 1)) * plotH;
  ctx.fillStyle = "#ea2261";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function money(value) {
  if (!Number.isFinite(Number(value))) return "$--";
  return `$${Number(value).toFixed(2)}`;
}

function labelCase(value) {
  return String(value).replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
