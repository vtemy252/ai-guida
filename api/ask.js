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
            role: "user",
            content: `Я здесь: ${lat}, ${lng}. Что интересного рядом?`
          }
        ]
      })
    });

    const data = await response.json();

    // 🔥 ВАЖНО — сразу показываем ошибку если есть
    if (data.error) {
      return res.status(500).json({
        ok: false,
        error: data.error.message || "OpenRouter error",
        raw: data
      });
    }

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      return res.status(500).json({
        ok: false,
        error: "EMPTY_RESPONSE",
        raw: data
      });
    }

    return res.status(200).json({
      ok: true,
      text
    });

  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: e.message
    });
  }
}
