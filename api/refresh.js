import { getSnapshot, json } from "./_core.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  json(res, 200, await getSnapshot({ force: true }));
}
