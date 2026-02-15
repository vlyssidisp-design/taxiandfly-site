export default async function handler(req, res) {
  // CORS (για να δουλεύει από browser)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const apiKey = process.env.ORS_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing ORS_API_KEY on server" });

    const { start, end } = req.body || {};
    // start/end πρέπει να είναι [lng, lat]
    if (!Array.isArray(start) || !Array.isArray(end) || start.length !== 2 || end.length !== 2) {
      return res.status(400).json({ error: "Invalid coordinates. Expect start/end as [lng, lat]." });
    }

    const r = await fetch("https://api.openrouteservice.org/v2/directions/driving-car", {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        coordinates: [start, end]
      })
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({
        error: "ORS request failed",
        details: data
      });
    }

    // meters -> km
    const meters = data?.features?.[0]?.properties?.segments?.[0]?.distance;
    if (typeof meters !== "number") {
      return res.status(500).json({ error: "Distance not found in ORS response", details: data });
    }

    return res.status(200).json({ km: +(meters / 1000).toFixed(1) });
  } catch (e) {
    return res.status(500).json({ error: "Server error", details: String(e) });
  }
}
