export default async function handler(req, res) {
  try {

    const { lat, lng } = req.body || {};

    const geoKey = process.env.GEOAPIFY_KEY;
    const openKey = process.env.OPENROUTER_API_KEY;

    // ===== GEOAPIFY =====

    const url =
      `https://api.geoapify.com/v2/places?categories=` +
      `tourism.sights,leisure.park,catering.restaurant,catering.cafe,entertainment,commercial` +
      `&filter=circle:${lng},${lat},2000` +
      `&bias=proximity:${lng},${lat}` +
      `&limit=15` +
      `&apiKey=${geoKey}`;

    const response = await fetch(url);
    const data = await response.json();

    const badWords = ["памятник", "скульптура", "бюст"];

    const used = new Set();

    let places = (data.features || [])
      .map(p => {

        const pr = p.properties;

        const name = pr.name;

        if (!name) return null;

        const lower = name.toLowerCase();

        if (badWords.some(w => lower.includes(w))) {
          return null;
        }

        if (used.has(name)) return null;

        used.add(name);

        return {
          name,
          type: pr.categories?.[0] || "место",
          distance: Math.round(pr.distance || 0)
        };

      })
      .filter(Boolean)
      .slice(0, 10);

    // ===== OPENROUTER AI =====

    const aiResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "Ты локальный гид. Для каждого места дай краткое описание 1 предложением."
            },
            {
              role: "user",
              content:
                "Места:\n" +
                places.map(p => p.name).join("\n")
            }
          ]
        })
      }
    );

    const aiData = await aiResponse.json();

    const aiText =
      aiData?.choices?.[0]?.message?.content || "";

    const descriptions = aiText
      .split("\n")
      .filter(Boolean);

    places = places.map((p, i) => ({
      ...p,
      description:
        descriptions[i] || "Интересное место рядом"
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
