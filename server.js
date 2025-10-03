import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sql from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

// 🚀 Ruta: obtener videos
app.get("/api/videos", async (req, res) => {
  try {
    const videos = await sql`SELECT * FROM videos ORDER BY id DESC`;
    res.json(videos);
  } catch (err) {
    console.error("❌ Error en /api/videos:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🚀 Ruta: agregar video
app.post("/api/videos", async (req, res) => {
  try {
    const { url } = req.body;
    let embedUrl = url;

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const id = url.split("v=")[1] || url.split("/").pop();
      embedUrl = `https://www.youtube.com/embed/${id}`;
    } else if (url.includes("dailymotion.com")) {
      const id = url.split("/video/")[1];
      embedUrl = `https://www.dailymotion.com/embed/video/${id}`;
    }

    const [video] = await sql`
      INSERT INTO videos (url, platform, embed_url)
      VALUES (${url}, 'auto', ${embedUrl})
      RETURNING *;
    `;

    res.json(video);
  } catch (err) {
    console.error("❌ Error en /api/videos (POST):", err);
    res.status(500).json({ error: err.message });
  }
});

// 🚀 Ruta: borrar video
app.delete("/api/videos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM videos WHERE id = ${id}`;
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error en /api/videos (DELETE):", err);
    res.status(500).json({ error: err.message });
  }
});

// 🚀 Contador de visitas
app.get("/api/visita", async (req, res) => {
  try {
    const [v] = await sql`SELECT contador FROM visitas WHERE id = 1`;
    res.json(v || { contador: 0 });
  } catch (err) {
    console.error("❌ Error en /api/visita (GET):", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/visita", async (req, res) => {
  try {
    const [v] = await sql`
      UPDATE visitas
      SET contador = contador + 1
      WHERE id = 1
      RETURNING contador;
    `;
    res.json(v);
  } catch (err) {
    console.error("❌ Error en /api/visita (POST):", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
