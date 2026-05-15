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
        model: "openai/gpt-3.5-turbo",

        messages: [
          {
            role: "system",
            content: `
Ты локальный туристический гид.

Разделяй ответ строго на 2 части:

1) 🔵 РЯДОМ (0–500 метров)
2) 🟡 ЧУТЬ ДАЛЬШЕ (500м–3 км)

Правила:
- Не выдумывай точные места, если не уверен — пиши "неизвестно"
- Не перечисляй весь город
- Отвечай кратко, списком
`
          },
          {
            role: "user",
            content: `Координаты: ${lat}, ${lng}. Что находится рядом?`
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({
        ok: false,
        error: data.error.message,
        raw: data
      });
    }

    const text = data?.choices?.[0]?.message?.content;

    return res.status(200).json({
      ok: true,
      text: text || "Пустой ответ"
    });

  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: e.message
    });
  }
}
