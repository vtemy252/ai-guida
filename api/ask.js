export default async function handler(req, res) {
  try {

    const { lat, lng } = req.body || {};

    if (!lat || !lng) {
      return res.status(400).json({
        ok: false,
        error: "Нет координат"
      });
    }

    // Ищем POI вокруг пользователя
    const radius = 1200;

    const query = `
[out:json];
(
  node(around:${radius},${lat},${lng})[amenity];
  node(around:${radius},${lat},${lng})[tourism];
  node(around:${radius},${lat},${lng})[historic];
  node(around:${radius},${lat},${lng})[leisure];
  node(around:${radius},${lat},${lng})[shop];
  node(around:${radius},${lat},${lng})[railway=station];
);
out;
`;

    const osmRes = await fetch(
      "https://overpass.kumi.systems/api/interpreter",
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain"
        },
        body: query
      }
    );

    const raw = await osmRes.text();

    let osmData;

    try {
      osmData = JSON.parse(raw);
    } catch (e) {
      return res.status(500).json({
        ok: false,
        error: "OSM сервер вернул не JSON",
        raw: raw.slice(0, 300)
      });
    }

    function distance(lat1, lon1, lat2, lon2) {
      const R = 6371e3;

      const φ1 = lat1 * Math.PI/180;
      const φ2 = lat2 * Math.PI/180;

      const Δφ = (lat2-lat1) * Math.PI/180;
      const Δλ = (lon2-lon1) * Math.PI/180;

      const a =
        Math.sin(Δφ/2) * Math.sin(Δφ/2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ/2) * Math.sin(Δλ/2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return Math.round(R * c);
    }

    const places = osmData.elements
      .map(el => {

        const name = el.tags?.name;

        if (!name) return null;

        const type =
          el.tags?.amenity ||
          el.tags?.tourism ||
          el.tags?.historic ||
          el.tags?.leisure ||
          el.tags?.shop ||
          el.tags?.railway ||
          "место";

        const dist = distance(
          lat,
          lng,
          el.lat,
          el.lon
        );

        return {
          name,
          type,
          distance: dist
        };

      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20);

    return res.status(200).json({
      ok: true,
      places
    });

  } catch (e) {

    return res.status(500).json({
      ok: false,
      error: e.message
    });

  }
}
