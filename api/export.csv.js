import { getSnapshot, toCsv } from "./_core.mjs";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  await getSnapshot();
  res.status(200);
  res.setHeader("content-type", "text/csv; charset=utf-8");
  res.setHeader("content-disposition", "attachment; filename=ai-compute-prices.csv");
  res.setHeader("cache-control", "no-store");
  res.send(toCsv());
}
