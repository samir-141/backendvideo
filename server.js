// ==========================
// 📦 Importaciones
// ==========================
import express from "express";
import https from "https";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"; // Asegúrate de tenerlo instalado: npm install node-fetch

dotenv.config();

// ==========================
// ⚙️ Configuración de HTTPS
// ==========================
const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/rimstream.duckdns.org/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/rimstream.duckdns.org/fullchain.pem")
};

// ==========================
// 🚀 Inicialización del servidor
// ==========================
const app = express();
const PORT = process.env.PORT || 443;

// Middlewares
app.use(cors({ origin: "*", methods: "GET,POST,PUT,DELETE", allowedHeaders: "*" }));
app.use(express.json());

// ==========================
// 🧩 Rutas base
// ==========================
app.get("/", (req, res) => {
  res.send("✅ Servidor HTTPS activo");
});

// ==========================
// 🔐 Ruta de login
// ==========================
app.post("/api/login", async (req, res) => {
  try {
    const { user, pass } = req.body;

    // Usuario administrador “en duro” (puedes usar variables .env)
    const ADMIN_USER = process.env.ADMIN_USER || "admin";
    const ADMIN_PASS = process.env.ADMIN_PASS || "1234";

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      // Generar token simulado (puedes reemplazarlo por JWT)
      const fakeToken = "token_" + Math.random().toString(36).substring(2);
      return res.json({ token: fakeToken });
    } else {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

  } catch (err) {
    console.error("❌ Error en /api/login:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ==========================
// 🧠 Ejemplo de endpoint API
// ==========================
app.get("/api/videos", async (req, res) => {
  try {
    // Ejemplo: podrías reemplazar esto con consulta a tu base de datos
    const videos = [
      { id: 1, titulo: "Video de prueba", url: "https://example.com/video1.mp4" },
      { id: 2, titulo: "Video 2", url: "https://example.com/video2.mp4" }
    ];
    res.json(videos);
  } catch (error) {
    console.error("❌ Error en /api/videos:", error);
    res.status(500).json({ error: "Error al cargar videos" });
  }
});

// ==========================
// 🧠 Ruta de visitas
// ==========================
app.post("/api/visita", async (req, res) => {
  try {
    console.log("👀 Nueva visita registrada");
    res.json({ ok: true });
  } catch (error) {
    console.error("❌ Error en /api/visita:", error);
    res.status(500).json({ error: "Error registrando visita" });
  }
});

// ==========================
// 🌐 Iniciar servidor HTTPS
// ==========================
https.createServer(options, app).listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend corriendo en https://rimstream.duckdns.org (puerto ${PORT})`);
});
