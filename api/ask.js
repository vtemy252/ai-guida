export default async function handler(req, res) {
  const { lat, lng } = req.body;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [
        {
          role: "user",
          content: `Я здесь: ${lat}, ${lng}. Что рядом?`
        }
      ]
    })
  });

  const data = await response.json();

  res.json({
    text: data.choices?.[0]?.message?.content || "Нет ответа"
  });
}
