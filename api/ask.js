export default async function handler(req, res) {
  try {
    const { lat, lng } = req.body || {};

    if (!lat || !lng) {
      return res.status(400).json({ error: "No GPS data" });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: "openchat/openchat-7b:free",
        messages: [
          {
            role: "user",
            content: `Я здесь: ${lat}, ${lng}. Что интересного рядом?`
          }
        ]
      })
    });

    const text = await response.text();

    // 🔥 ВАЖНО: сначала выводим RAW ответ (это диагностика)
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        error: "Invalid JSON from OpenRouter",
        raw: text
      });
    }

    console.log("OPENROUTER:", data);

    if (data.error) {
      return res.status(500).json({
        error: data.error.message || "OpenRouter error",
        raw: data
      });
    }

    const answer =
      data?.choices?.[0]?.message?.content ||
      "Нет ответа от модели";

    return res.status(200).json({ text: answer });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
