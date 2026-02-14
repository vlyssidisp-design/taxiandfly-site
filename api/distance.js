// /api/distance.js
export default async function handler(req, res) {
  try {
    const { address } = req.method === "POST" ? req.body : req.query;
    if (!address || String(address).trim().length < 4) {
      return res.status(400).json({ error: "Missing address" });
    }

    const ORS_KEY = process.env.ORS_API_KEY;
    if (!ORS_KEY) {
      return res.status(500).json({ error: "Missing ORS_API_KEY env var" });
    }

    // 1) Geocode (free) with Nominatim (OpenStreetMap)
    // NOTE: Provide a polite User-Agent / Referer.
    const q = encodeURIComponent(String(address).trim() + ", Athens, Greece");
    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`;
    const geoResp = await fetch(geoUrl, {
      headers: {
        "User-Agent": "taxiandfly.com (distance calculator)",
        "Accept": "application/json",
      },
    });

    if (!geoResp.ok) {
      return res.status(502).json({ error: "Geocode failed" });
    }

    const geo = await geoResp.json();
    if (!geo?.length) {
      return res.status(404).json({ error: "Address not found" });
    }

    const pickupLat = Number(geo[0].lat);
    const pickupLon = Number(geo[0].lon);

    // 2) Directions to Athens Airport (ATH) using ORS
    // ATH approximate coordinates (Eleftherios Venizelos):
    const ATH_LON = 23.9445;
    const ATH_LAT = 37.9364;

    const orsResp = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      {
        method: "POST",
        headers: {
          "Authorization": ORS_KEY,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          coordinates: [
            [pickupLon, pickupLat],
            [ATH_LON, ATH_LAT],
          ],
        }),
      }
    );

    if (!orsResp.ok) {
      const text = await orsResp.text().catch(() => "");
      return res.status(502).json({ error: "ORS failed", details: text.slice(0, 300) });
    }

    const ors = await orsResp.json();
    const meters = ors?.routes?.[0]?.summary?.distance;

    if (!meters && meters !== 0) {
      return res.status(502).json({ error: "No distance in ORS response" });
    }

    const km = Math.round((meters / 1000) * 10) / 10; // 1 decimal
    return res.status(200).json({ km });
  } catch (e) {
    return res.status(500).json({ error: "Server error", details: String(e?.message || e) });
  }
}
