import { cancelJob, json } from "../../_core.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  const job = await cancelJob(req.query.id);
  if (!job) return json(res, 404, { error: "Not found" });
  json(res, 200, { job });
}
