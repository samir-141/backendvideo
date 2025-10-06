// ==========================
// 📦 Importaciones
// ==========================
import express from "express";
import https from "https";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg"; // Cliente PostgreSQL (Supabase usa PostgreSQL)
const { Pool } = pkg;

dotenv.config();

// ==========================
// 🔐 Configuración de HTTPS
// ==========================
const options = {
  key: fs.readFileSync("/home/admin/certs/privkey.pem"),
  cert: fs.readFileSync("/home/admin/certs/fullchain.pem"),
};

// ==========================
// 🧠 Configuración de conexión a Supabase
// ==========================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================
// 🚀 Inicialización del servidor
// ==========================
const app = express();
const PORT = process.env.PORT || 443;

app.use(cors({ origin: "*", methods: "GET,POST,PUT,DELETE", allowedHeaders: "*" }));
app.use(express.json());

// ==========================
// ✅ Ruta base de prueba
// ==========================
app.get("/", (req, res) => {
  res.send("✅ Servidor HTTPS con conexión a Supabase activo");
});

// ==========================
// 🔐 Ruta de login (consulta en base de datos)
// ==========================
app.post("/api/login", async (req, res) => {
  try {
    const { user, pass } = req.body;

    // Consulta a tu tabla de usuarios en Supabase (ajusta el nombre de la tabla y columnas)
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE usuario = $1 AND password = $2",
      [user, pass]
    );

    if (result.rows.length > 0) {
      const fakeToken = "token_" + Math.random().toString(36).substring(2);
      return res.json({ token: fakeToken, usuario: result.rows[0] });
    } else {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
  } catch (err) {
    console.error("❌ Error en /api/login:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ==========================
// 📹 Ejemplo: listar videos desde tabla “videos”
// ==========================
app.get("/api/videos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM videos ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error en /api/videos:", error);
    res.status(500).json({ error: "Error al obtener los videos" });
  }
});

// ==========================
// 📈 Ejemplo: registrar visita
// ==========================
app.post("/api/visita", async (req, res) => {
  try {
    const { ip } = req.body;
    await pool.query("INSERT INTO visitas (ip, fecha) VALUES ($1, NOW())", [ip]);
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
  console.log(`✅ Backend conectado a Supabase corriendo en https://rimstream.duckdns.org (puerto ${PORT})`);
});
