import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sql from "./db.js";
import fetch from "node-fetch"; // 👈 asegúrate de tenerlo instalado

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

dotenv.config();


// 🔹 función auxiliar para obtener título del video
async function obtenerTitulo(url) {
  try {
    // usamos el oEmbed de YouTube o Dailymotion
    if (url.includes("youtube") || url.includes("youtu.be")) {
      const id = url.split("v=")[1] || url.split("/").pop();
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
      const res = await fetch(oembedUrl);
      const data = await res.json();
      return data.title || "Video de YouTube";
    } else if (url.includes("dailymotion")) {
      const id = url.split("/video/")[1];
      const oembedUrl = `https://www.dailymotion.com/services/oembed?url=https://www.dailymotion.com/video/${id}`;
      const res = await fetch(oembedUrl);
      const data = await res.json();
      return data.title || "Video de Dailymotion";
    }
    return "Video";
  } catch (err) {
    console.error("❌ Error obteniendo título:", err);
    return "Video sin título";
  }
}

// 🔹 Agregar video
app.post("/api/videos", async (req, res) => {
  try {
    const { url } = req.body;
    const title = await obtenerTitulo(url);

    let embedUrl = url;
    if (url.includes("youtube") || url.includes("youtu.be")) {
      const id = url.split("v=")[1] || url.split("/").pop();
      embedUrl = `https://www.youtube.com/embed/${id}`;
    } else if (url.includes("dailymotion")) {
      const id = url.split("/video/")[1];
      embedUrl = `https://www.dailymotion.com/embed/video/${id}`;
    }

    const [video] = await sql`
      INSERT INTO videos (url, title, platform, embed_url)
      VALUES (${url}, ${title}, 'auto', ${embedUrl})
      RETURNING *;
    `;

    res.json(video);
  } catch (err) {
    console.error("❌ Error al agregar video:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Obtener todos los videos
app.get("/api/videos", async (req, res) => {
  try {
    const videos = await sql`SELECT * FROM videos ORDER BY id DESC`;
    res.json(videos);
  } catch (err) {
    console.error("❌ Error al obtener videos:", err);
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
app.post("/api/login", async (req, res) => {
  const { user, pass } = req.body;

  // ✅ Usuario administrador “en duro”
  const ADMIN_USER = process.env.ADMIN_USER || "admin";
  const ADMIN_PASS = process.env.ADMIN_PASS || "1234";

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    // Puedes generar un token falso o JWT real, según tu necesidad
    const fakeToken = "token_" + Math.random().toString(36).substring(2);
    res.json({ token: fakeToken });
  } else {
    res.status(401).json({ error: "Credenciales inválidas" });
  }
});
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
