// db.js
import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

// Conexión con Supabase (usa la URL del .env)
const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false }, // importante para AWS/Supabase
});

export default sql;
