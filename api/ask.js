export default async function handler(req, res) {
  try {
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
            role: "user",
            content: "Say exactly: HELLO_TEST"
          }
        ]
      })
    });

    const data = await response.json();

    // 🔥 ВАЖНО: вернём ВСЁ как есть
    return res.status(200).json({
      ok: true,
      full: data
    });

  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: e.message
    });
  }
}
