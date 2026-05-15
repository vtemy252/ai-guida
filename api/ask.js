export default async function handler(req, res) {
  console.log("API CALLED");

  return res.status(200).json({
    ok: true,
    text: "API WORKS",
    body: req.body
  });
}
