export default async function handler(req, res) {
  try {
    const { lat, lng } = req.body || {};

    if (!lat || !lng) {
      return res.status(400).json({
        error: "No GPS data received"
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://your-site.vercel.app",
        "X-Title": "AI GPS Guide"
      },
      body: JSON.stringify({
        model: "openchat/openchat-7b:free",
        messages: [
          {
            role: "system",
            content: "Ты туристический гид. Отвечай кратко и понятно."
          },
          {
            role: "user",
            content: `Я нахожусь здесь: ${lat}, ${lng}. Что интересного рядом?`
          }
        ]
      })
    });

    const data = await response.json();

    // 🔥 ВАЖНО: логируем чтобы видеть реальный ответ
    console.log("OPENROUTER RESPONSE:", JSON.stringify(data, null, 2));

    // ❗ если API вернул ошибку
    if (data.error) {
      return res.status(500).json({
        error: data.error.message || "OpenRouter error",
        raw: data
      });
    }

    // ✔ правильное извлечение ответа
    const text =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      "Нет ответа от модели";

    return res.status(200).json({ text });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
