import dotenv from "dotenv";
import { generateToken } from "../utils/generateToken.js";

dotenv.config();

export function login(req, res) {
  const { user, pass } = req.body;
  const ADMIN_USER = process.env.ADMIN_USER || "admin";
  const ADMIN_PASS = process.env.ADMIN_PASS || "1234";

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    const token = generateToken({ user });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Credenciales inválidas" });
  }
}
