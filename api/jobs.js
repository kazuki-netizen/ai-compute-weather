import { createJob, getJobs, json } from "./_core.mjs";

export default async function handler(req, res) {
  if (req.method === "GET") return json(res, 200, { jobs: await getJobs() });
  if (req.method === "POST") return json(res, 201, { job: await createJob(req.body || {}) });
  return json(res, 405, { error: "Method not allowed" });
}
