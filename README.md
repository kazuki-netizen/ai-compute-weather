# AI Compute Weather

Local MVP for monitoring AI/GPU compute prices and dispatching non-real-time jobs when the market is cheap.

## Run

```bash
npm start
```

Open http://localhost:4173.

## Deploy on Vercel

This repository includes Vercel serverless API routes under `api/`.

```bash
npx vercel --prod
```

Vercel mode supports live Azure price collection, CSV export, and `dry-run` job dispatch. The `local` executor is intentionally local-only because Vercel serverless functions are not a durable worker environment for arbitrary shell commands. Run `npm start` locally for command execution, retries, timeouts, and local process logs.

## What works now

- Pulls live Azure GPU Spot VM prices from the unauthenticated Azure Retail Prices API.
- Normalizes offers into `provider`, `region`, `gpu`, `instance`, `priceUsdGpuHour`, and `sourceType`.
- Shows proxy connectors for Vast.ai, RunPod, AWS Spot, and GCP Spot so the router and UI can be tested without cloud credentials.
- Queues batch jobs and dispatches them when a matching offer is below the requested max price.
- Runs jobs through a pluggable execution layer:
  - `dry-run`: simulates a dispatch.
  - `local`: runs a shell command on this machine with selected-offer environment variables.
  - `vast` and `runpod`: connector placeholders for future live instance launch.
- Tracks execution attempts, stdout/stderr logs, retries, timeout, cancel, and terminal status.
- Exports the current normalized market table as CSV at `/api/export.csv`.

## Useful environment variables

```bash
PORT=4173
REFRESH_MS=600000
AZURE_REGIONS=eastus,westus3,japaneast
AZURE_FAMILIES=NC,ND
```

The connector health cards also detect these environment variables for future live integrations:

```bash
VAST_API_KEY=
RUNPOD_API_KEY=
AWS_PROFILE=
GOOGLE_APPLICATION_CREDENTIALS=
```

## API

```bash
GET  /api/snapshot
POST /api/refresh
GET  /api/jobs
POST /api/jobs
POST /api/jobs/:id/cancel
GET  /api/executors
GET  /api/export.csv
```

Example job:

```json
{
  "name": "embedding-backfill",
  "gpu": "A100",
  "executor": "local",
  "command": "python scripts/embed.py",
  "maxPriceUsdGpuHour": 1.75,
  "retryLimit": 1,
  "timeoutSeconds": 120,
  "deadlineHours": 6
}
```

Local commands receive these environment variables:

```bash
AI_COMPUTE_JOB_ID
AI_COMPUTE_PROVIDER
AI_COMPUTE_REGION
AI_COMPUTE_GPU
AI_COMPUTE_PRICE_USD_GPU_HOUR
```

## Next connector work

- AWS: call `DescribeSpotPriceHistory` for P/G/Trn/Inf instance families when AWS credentials are available.
- GCP: call Cloud Billing Pricing API or ingest exported billing data from BigQuery.
- Vast.ai: replace the proxy connector with live marketplace offers from the Vast.ai REST API.
- RunPod: replace the proxy connector with GraphQL `gpuTypes` pricing and availability.
