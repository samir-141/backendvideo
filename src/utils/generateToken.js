import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro";

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "4h" });
}
