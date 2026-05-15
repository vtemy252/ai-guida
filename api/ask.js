export default async function handler(req, res) {
  try {
    const { lat, lng } = req.body || {};

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",

        messages: [
          {
            role: "system",
            content: "Ты туристический гид. Отвечай коротко, только полезные места рядом."
          },
          {
            role: "user",
            content: `Я нахожусь здесь: ${lat}, ${lng}. Что рядом?`
          }
        ],

        temperature: 0.7,
        max_tokens: 200
      })
    });

    const data = await response.json();

    // 🔥 ВАЖНО: логируем если что-то не так
    if (!data.choices?.[0]?.message?.content) {
      return res.status(500).json({
        ok: false,
        error: "EMPTY_RESPONSE_FROM_MODEL",
        raw: data
      });
    }

    return res.status(200).json({
      ok: true,
      text: data.choices[0].message.content
    });

  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: e.message
    });
  }
}
