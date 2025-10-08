import express from "express";
import { verificarToken } from "../middlewares/auth.js";
import {
  obtenerVideos,
  agregarVideo,
  eliminarVideo,
  optenervistas,
  enviarvistas
} from "../controllers/videosController.js";

const router = express.Router();

router.get("/", obtenerVideos);
router.post("/", verificarToken, agregarVideo);
router.delete("/:id", verificarToken, eliminarVideo);
router.get("/vistas", optenervistas )
router.post("/vistas", enviarvistas )
export default router;
