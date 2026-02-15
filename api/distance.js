export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const ORS_API_KEY = process.env.ORS_API_KEY;

    const address =
      (req.method === "GET" ? req.query.q : req.body?.address) || "";

    if (!address) return res.status(400).json({ error: "Missing address" });

    // Geocode (OpenStreetMap)
    const geo = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address + " Athens Greece")}`,
      { headers: { "User-Agent": "TaxiAndFly" } }
    ).then(r => r.json());

    if (!geo[0]) return res.status(404).json({ error: "Address not found" });

    const lon = parseFloat(geo[0].lon);
    const lat = parseFloat(geo[0].lat);

    const ATH = [23.9445, 37.9364];

    const ors = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      {
        method: "POST",
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          coordinates: [[lon, lat], ATH]
        })
      }
    ).then(r => r.json());

    const meters = ors.features[0].properties.summary.distance;
    const km = Math.round((meters / 1000) * 10) / 10;

    res.status(200).json({ km });

  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
}
