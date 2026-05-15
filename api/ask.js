export default async function handler(req, res) {
  try {
    const { lat, lng } = req.body || {};

    if (!lat || !lng) {
      return res.status(400).json({
        ok: false,
        error: "Нет координат"
      });
    }

    const radius = 1200;

    const query = `
[out:json];
(
  node(around:${radius},${lat},${lng})[tourism];
  node(around:${radius},${lat},${lng})[historic];
  node(around:${radius},${lat},${lng})[amenity];
  node(around:${radius},${lat},${lng})[leisure];
);
out;
`;

    const osmRes = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        body: query
      }
    );

    const osmData = await osmRes.json();

    const places = osmData.elements
      .map(el => ({
        name: el.tags?.name,
        type:
          el.tags?.tourism ||
          el.tags?.historic ||
          el.tags?.amenity ||
          el.tags?.leisure
      }))
      .filter(p => p.name)
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
