export default async function handler(req, res) {
  try {

    const { lat, lng } = req.body || {};

    if (!lat || !lng) {
      return res.status(400).json({
        ok: false,
        error: "Нет координат"
      });
    }

    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "AI-GPS-Guide"
      }
    });

    const data = await response.json();

    return res.status(200).json({
      ok: true,
      place: data.display_name,
      address: data.address
    });

  } catch (e) {

    return res.status(500).json({
      ok: false,
      error: e.message
    });

  }
}
