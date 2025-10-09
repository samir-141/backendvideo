import express from "express";
import https from "https";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import videosRoutes from "./src/routes/videos.js";
import authRoutes from "./src/routes/auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ================================
// 🌐 Rutas
// ================================
app.get("/", (req, res) => {
  res.send("Servidor HTTPS con Supabase activo ✅");
});

app.use("/api/videos", videosRoutes);
app.use("/api", authRoutes);

// ================================
// 🚀 Iniciar servidor
// ================================
const PORT = process.env.PORT || 3000;
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
