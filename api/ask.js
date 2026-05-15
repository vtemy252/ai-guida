export default async function handler(req, res) {
  try {
    const { lat, lng } = req.body || {};

    if (!lat || !lng) {
      return res.status(400).json({
        ok: false,
        error: "NO_GPS",
        message: "No GPS data received"
      });
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
            content: `Я здесь: ${lat}, ${lng}. Что рядом?`
          }
        ]
      })
    });

    const data = await response.json();

    // ❗ ЕСЛИ ОШИБКА ОТ OPENROUTER
    if (!response.ok) {
      return res.status(500).json({
        ok: false,
        error: "OPENROUTER_ERROR",
        message: data?.error?.message || "Unknown OpenRouter error",
        raw: data
      });
    }

    const text =
      data?.choices?.[0]?.message?.content;

    if (!text) {
      return res.status(500).json({
        ok: false,
        error: "EMPTY_RESPONSE",
        message: "No text returned from model",
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
      error: "SERVER_ERROR",
      message: e.message
    });
  }
}
