import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Conexión BD
const db = new sqlite3.Database("./db.sqlite", (err) => {
  if (err) console.error("❌ Error al conectar DB:", err.message);
  else console.log("✅ Conectado a SQLite");
});

// Crear tabla si no existe
db.run(`
  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT,
    platform TEXT,
    embed_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
// --- TABLA VISITAS ---
db.run(`
  CREATE TABLE IF NOT EXISTS visitas (
    id INTEGER PRIMARY KEY,
    contador INTEGER
  )
`);

// Inicializar visitas si no existe registro
db.get(`SELECT * FROM visitas WHERE id = 1`, (err, row) => {
  if (!row) {
    db.run(`INSERT INTO visitas (id, contador) VALUES (1, 0)`);
  }
});

// Ruta para aumentar visitas
app.post("/api/visita", (req, res) => {
  db.run(`UPDATE visitas SET contador = contador + 1 WHERE id = 1`, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get(`SELECT contador FROM visitas WHERE id = 1`, (err, row) => {
      res.json(row);
    });
  });
});

// Ruta para obtener visitas (solo consultar)
app.get("/api/visita", (req, res) => {
  db.get(`SELECT contador FROM visitas WHERE id = 1`, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// --- CONFIG ADMIN ---
const ADMIN_USER = "admin";
const ADMIN_PASS = "12345"; // ⚠️ cambia esto a lo que quieras
const ADMIN_TOKEN = "supersecreto123"; // clave que valida el backend

// --- LOGIN ---
app.post("/api/login", (req, res) => {
  const { user, pass } = req.body;
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    res.json({ token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ error: "Credenciales inválidas" });
  }
});

// --- FUNCION EMBED ---
function getEmbedUrl(url) {
  let embed = "";
  let platform = "";

  if (url.includes("youtube.com/watch")) {
    const id = new URL(url).searchParams.get("v");
    embed = `https://www.youtube.com/embed/${id}`;
    platform = "YouTube";
  } else if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1].split("?")[0];
    embed = `https://www.youtube.com/embed/${id}`;
    platform = "YouTube";
  } else if (url.includes("youtube.com/shorts/")) {
    const id = url.split("shorts/")[1].split("?")[0];
    embed = `https://www.youtube.com/embed/${id}`;
    platform = "YouTube";
  } else if (url.includes("youtube.com/live/")) {
    const id = url.split("live/")[1].split("?")[0];
    embed = `https://www.youtube.com/embed/${id}`;
    platform = "YouTube";
  } else if (url.includes("dailymotion.com/video/")) {
    const id = url.split("video/")[1].split("?")[0];
    embed = `https://www.dailymotion.com/embed/video/${id}`;
    platform = "Dailymotion";
  } else if (url.includes("vimeo.com/")) {
    const id = url.split("vimeo.com/")[1].split("?")[0];
    embed = `https://player.vimeo.com/video/${id}`;
    platform = "Vimeo";
  }

  return { embed, platform };
}

// --- RUTAS VIDEOS ---
app.post("/api/videos", (req, res) => {
  const { url } = req.body;
  const { embed, platform } = getEmbedUrl(url);

  if (!embed) return res.status(400).json({ error: "Plataforma no soportada" });

  db.run(
    `INSERT INTO videos (url, platform, embed_url) VALUES (?, ?, ?)`,
    [url, platform, embed],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, url, platform, embed });
    }
  );
});

app.get("/api/videos", (req, res) => {
  db.all(`SELECT * FROM videos ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.delete("/api/videos/:id", (req, res) => {
  const { authorization } = req.headers;

  if (authorization !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(403).json({ error: "No autorizado" });
  }

  db.run(`DELETE FROM videos WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// --- START ---
app.listen(PORT, () => console.log(`🚀 Backend en http://localhost:${PORT}`));
