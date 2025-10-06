// ================================
// 📦 Importaciones
// ================================
import express from "express";
import https from "https";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import sql from "./db.js"; // 👈 usa tu conexión centralizada
dotenv.config();

// ================================
// 🔐 Configuración de HTTPS
// ================================
const options = {
  key: fs.readFileSync("/home/admin/certs/privkey.pem"),
  cert: fs.readFileSync("/home/admin/certs/fullchain.pem"),
};

// ================================
// ⚙️ Configuración de Express
// ================================
const app = express();
app.use(cors());
app.use(express.json());

// ================================
// 🚀 Rutas
// ================================

// Ruta base (verificación)
app.get("/", (req, res) => {
  res.send("Servidor HTTPS con Supabase activo ✅");
});

// Ruta para obtener videos desde Supabase
app.get("/api/videos", async (req, res) => {
  try {
    const result = await sql`SELECT * FROM videos;`;
    res.json(result);
  } catch (err) {
    console.error("❌ Error al obtener videos:", err);
    res.status(500).json({ error: "Error interno al obtener videos" });
  }
});

// Ruta para registrar visitas (ejemplo)
app.post("/api/visita", async (req, res) => {
  try {
    const { video_id } = req.body;
    await sql`INSERT INTO visitas (video_id, fecha) VALUES (${video_id}, NOW());`;
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error al registrar visita:", err);
    res.status(500).json({ error: "Error al registrar visita" });
  }
});

// Ruta de login (simple, temporal)
app.post("/api/login", async (req, res) => {
  const { user, pass } = req.body;
  const ADMIN_USER = process.env.ADMIN_USER || "admin";
  const ADMIN_PASS = process.env.ADMIN_PASS || "1234";

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    const token = "token_" + Math.random().toString(36).substring(2);
    res.json({ token });
  } else {
    res.status(401).json({ error: "Credenciales inválidas" });
  }
});

// ================================
// 🌐 Iniciar servidor HTTPS
// ================================
const PORT = process.env.PORT || 443;

https.createServer(options, app).listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend corriendo en https://rimstream.duckdns.org:${PORT}`);
});
