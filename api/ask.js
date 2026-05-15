export default async function handler(req, res) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "user",
            content: "Say ONLY: TEST_OK"
          }
        ]
      })
    });

    const text = await response.text();

    return res.status(200).json({
      raw: text
    });

  } catch (e) {
    return res.status(500).json({
      error: e.message
    });
  }
}
