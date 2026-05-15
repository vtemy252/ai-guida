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
            role: "user",
            content: "Say ONLY: OK"
          }
        ]
      })
    });

    const rawText = await response.text();

    return res.status(200).json({
      ok: true,
      status: response.status,
      raw: rawText
    });

  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: e.message
    });
  }
}
