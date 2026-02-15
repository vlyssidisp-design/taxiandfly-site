export default async function handler(req, res) {
  // CORS (για να μη σπάει σε browser)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const ORS_API_KEY = process.env.ORS_API_KEY;
    if (!ORS_API_KEY) {
      return res.status(500).json({ error: "Missing ORS_API_KEY env var on Vercel" });
    }

    // Δέχεται είτε GET ?q=address είτε POST { address: "..." }
    const address =
      (req.method === "GET" ? req.query.q : req.body?.address) || "";

    if (!address || String(address).trim().length < 4) {
      return res.status(400).json({
        error: "Missing address. Use GET /api/distance?q=ermou+10+athens or POST {address}",
      });
    }

    // 1) Geocode (δωρεάν) μέσω Nominatim (OpenStreetMap)
    const q = encodeURIComponent(`${address}, Athens, Greece`);
    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=0&q=${q}`;

    const geoResp = await fetch(geoUrl, {
      headers: {
        // απαιτείται User-Agent
        "User-Agent": "TaxiAndFlyDistanceCalculator/1.0 (taxiandfly.com)",
        "Accept": "application/json",
      },
    });

    if (!geoResp.ok) {
      return res.status(502).json({ error: "Geocoding failed", status: geoResp.status });
    }

    const geo = await geoResp.json();
    if (!geo || !geo[0]) {
      return res.status(404).json({ error: "Address not found" });
    }

    const lon = parseFloat(geo[0].lon);
    const lat = parseFloat(geo[0].lat);

    // 2) Route distance μέσω OpenRouteService προς ATH
    // NOTE: ORS θέλει [lon, lat]
    const ATH = [23.9445, 37.9364]; // Athens International Airport (approx)

    const orsResp = await fetch("https://api.openrouteservice.org/v2/directions/driving-car", {
      method: "POST",
      headers: {
        Authorization: ORS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [lon, lat],
          ATH,
        ],
      }),
    });

    if (!orsResp.ok) {
      const txt = await orsResp.text().catch(() => "");
      return res.status(502).json({ error: "ORS request failed", status: orsResp.status, details: txt.slice(0, 500) });
    }

    const data = await orsResp.json();
    const meters = data?.features?.[0]?.properties?.summary?.distance;

    if (typeof meters !== "number") {
      return res.status(500).json({ error: "Unexpected ORS response format" });
    }

    const km = Math.round((meters / 1000) * 10) / 10; // 1 δεκαδικό

    return res.status(200).json({ km });
  } catch (e) {
    return res.status(500).json({ error: "Server error", details: String(e?.message || e) });
  }
}
