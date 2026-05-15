export default async function handler(req, res) {
  try {

    const { lat, lng } = req.body || {};

    if (!lat || !lng) {
      return res.status(400).json({
        ok: false,
        error: "Нет координат"
      });
    }

    const apiKey = process.env.GEOAPIFY_KEY;

    const url =
      `https://api.geoapify.com/v2/places?categories=` +
      `tourism.sights,entertainment,leisure,commercial,heritage` +
      `&filter=circle:${lng},${lat},1000` +
      `&limit=20` +
      `&apiKey=${apiKey}`;

    const response = await fetch(url);

    const data = await response.json();

    const places = (data.features || []).map(place => ({
      name:
        place.properties.name ||
        "Без названия",

      type:
        place.properties.categories?.[0] ||
        "место",

      distance:
        place.properties.distance || 0
    }));

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
