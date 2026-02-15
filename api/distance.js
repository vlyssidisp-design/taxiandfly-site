export default async function handler(req, res) {

  try {

    const response = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      {
        method: "POST",
        headers: {
          "Authorization": "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjY1NzZjOGUyOTAxYjQxMDNhZmFkZTQ2YTU5ZTM0ZjhiIiwiaCI6Im11cm11cjY0In0=",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          coordinates: [
            [23.9445, 37.9364],
            [23.7275, 37.9838]
          ]
        })
      }
    );

    const data = await response.json();

    const meters = data.routes[0].summary.distance;
    const km = (meters / 1000).toFixed(1);

    res.status(200).json({ km });

  } catch (e) {
    res.status(500).json({ error: "distance error" });
  }
}
