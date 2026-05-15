export default async function handler(req, res) {
  try {

    const { lat, lng } = req.body || {};
    const apiKey = process.env.GEOAPIFY_KEY;

    const url =
      `https://api.geoapify.com/v2/places?categories=` +
      `tourism.sights,leisure.park,catering.restaurant,catering.cafe,entertainment,public_transport,commercial` +
      `&filter=circle:${lng},${lat},2000` +
      `&bias=proximity:${lng},${lat}` +
      `&limit=50` +
      `&apiKey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    const badWords = ["памятник", "скульптура", "бюст"];

    const used = new Set();

    const places = (data.features || [])
      .map(p => {
        const pr = p.properties;

        const name = pr.name;
        const distance = Math.round(pr.distance || 0);

        if (!name) return null;

        const lower = name.toLowerCase();

        // убираем мусорные памятники
        if (badWords.some(w => lower.includes(w))) return null;

        if (used.has(name)) return null;
        used.add(name);

        return {
          name,
          type: pr.categories?.[0] || "место",
          distance
        };

      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 15);

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
