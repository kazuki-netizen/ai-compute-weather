import { executorCatalog, json } from "./_core.mjs";

export default function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  json(res, 200, {
    executors: executorCatalog(),
    maxConcurrentExecutions: 1,
    activeExecutions: 0
  });
}
