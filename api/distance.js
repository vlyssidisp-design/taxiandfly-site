export default async function handler(req, res) {

  const ORS_API_KEY = process.env.ORS_API_KEY;

  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: "No address provided" });
    }

    // 1. Geocode address -> coordinates
    const geo = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(address)}`
    );

    const geoData = await geo.json();

    const coords = geoData.features?.[0]?.geometry?.coordinates;

    if (!coords) {
      return res.status(404).json({ error: "Address not found" });
    }

    const [lon, lat] = coords;

    // ATH airport coords
    const ATH = [23.9445, 37.9364];

    // 2. Directions
    const route = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      {
        method: "POST",
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: [
            [lon, lat],
            ATH
          ],
        }),
      }
    );

    const routeData = await route.json();

    const meters = routeData.routes[0].summary.distance;
    const km = Math.round(meters / 100) / 10;

    res.status(200).json({ km });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}
