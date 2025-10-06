// ================================
// 📦 Importaciones
// ================================
import express from "express";
import https from "https";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import sql from "./db.js";
import jwt from "jsonwebtoken";

dotenv.config();

// ================================
// ⚙️ Configuración base
// ================================
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro";

// ================================
// 🧱 Middleware: verificar token
// ================================
function verificarToken(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(403).json({ error: "Token requerido" });

  const token = header.split(" ")[1];
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

// ================================
// 🚀 Rutas API
// ================================

// Ruta base
app.get("/", (req, res) => {
  res.send("Servidor HTTPS con Supabase activo ✅");
});

// Obtener videos
app.get("/api/videos", async (req, res) => {
  try {
    const result = await sql`SELECT * FROM videos ORDER BY id DESC;`;
    res.json(result);
  } catch (err) {
    console.error("❌ Error al obtener videos:", err);
    res.status(500).json({ error: "Error interno al obtener videos" });
  }
});

// Agregar video
app.post("/api/videos", verificarToken, async (req, res) => {
  try {
    const { titulo, url } = req.body;
    if (!titulo || !url) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }
    await sql`
      INSERT INTO videos (titulo, url, fecha_subida)
      VALUES (${titulo}, ${url}, NOW());
    `;
    res.json({ success: true, message: "Video agregado correctamente" });
  } catch (err) {
    console.error("❌ Error al agregar video:", err);
    res.status(500).json({ error: "Error interno al agregar video" });
  }
});

// Eliminar video
app.delete("/api/videos/:id", verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM videos WHERE id = ${id};`;
    res.json({ success: true, message: "Video eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar video:", err);
    res.status(500).json({ error: "Error interno al eliminar video" });
  }
});

// Registrar visita
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

// Login de administrador
app.post("/api/login", async (req, res) => {
  const { user, pass } = req.body;
  const ADMIN_USER = process.env.ADMIN_USER || "admin";
  const ADMIN_PASS = process.env.ADMIN_PASS || "1234";

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    const token = jwt.sign({ user }, JWT_SECRET, { expiresIn: "4h" });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Credenciales inválidas" });
  }
});

// ================================
// 🌐 Iniciar servidor
// ================================
if (process.env.NODE_ENV === "production") {
  const options = {
    key: fs.readFileSync("/home/admin/certs/privkey.pem"),
    cert: fs.readFileSync("/home/admin/certs/fullchain.pem"),
  };
  https.createServer(options, app).listen(PORT, "0.0.0.0", () => {
    console.log(`🔒 Servidor HTTPS activo en puerto ${PORT}`);
  });
} else {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🟢 Servidor HTTP (modo desarrollo) en http://localhost:${PORT}`);
  });
}
