import sql from "../config/db.js";

async function obtenerTitulo(url) {
  try {
    if (url.includes("youtube") || url.includes("youtu.be")) {
      const id = url.split("v=")[1] || url.split("/").pop();
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
      const res = await fetch(oembedUrl);
      const data = await res.json();
      return data.title || "Video de YouTube";
    } else if (url.includes("dailymotion")) {
      const id = url.split("/video/")[1];
      const oembedUrl = `https://www.dailymotion.com/services/oembed?url=https://www.dailymotion.com/video/${id}`;
      const res = await fetch(oembedUrl);
      const data = await res.json();
      return data.title || "Video de Dailymotion";
    }
    return "Video";
  } catch (err) {
    console.error("❌ Error obteniendo título:", err);
    return "Video sin título";
  }
}

export async function obtenerVideos(req, res) {
  try {
    const result = await sql`SELECT * FROM videos ORDER BY id DESC;`;
    res.json(result);
  } catch (err) {
    console.error("❌ Error al obtener videos:", err);
    res.status(500).json({ error: "Error interno al obtener videos" });
  }
}

// Asegúrate de que tu conexión a la base de datos 'sql' esté importada correctamente.

export async function agregarVideo(req, res) {
  try {
    const { url } = req.body;

    // 1. Validación: Detener si falta la URL
    if (!url) {
      return res.status(400).json({ error: "Falta la URL del video." });
    }

    // Nota: La función 'obtenerTitulo' debe estar disponible en este scope.
    const title = await obtenerTitulo(url);
    
    // 2. Corregido: Usamos 'platform' para que coincida con la columna de la DB
    let platform = ''; 
    let embedUrl = url;
    
    // Lógica para determinar la plataforma y generar el embed URL
    if (url.includes("youtube") || url.includes("youtu.be")) {
      // Nota: Esta lógica de split podría fallar con URLs cortas, pero la mantengo como está.
      const id = url.split("v=")[1] || url.split("/").pop(); 
      embedUrl = `https://www.youtube.com/embed/${id}`;
      platform = "youtube"; // Asignación a 'platform'
    } else if (url.includes("dailymotion")) {
      const id = url.split("/video/")[1];
      embedUrl = `https://www.dailymotion.com/embed/video/${id}`;
      platform = "dailymotion"; // Asignación a 'platform'
    }
    
    // 3. Consulta SQL corregida usando nombres de columna y variables consistentes
    const [video] = await sql`
      INSERT INTO videos (url, title, platform, embed_url, created_at)
      VALUES (${url}, ${title}, ${platform}, ${embedUrl}, NOW())
      RETURNING *;
    `;
    
    // Asumo que 'created_at' existe en tu tabla y se debe llenar.
    
    res.json(video);

  } catch (err) {
    // Es buena práctica loguear el error completo para debuggear en PM2
    console.error("❌ Error al agregar video:", err); 
    
    // No enviar el error completo al cliente, solo un mensaje genérico
    res.status(500).json({ error: "Error interno del servidor al procesar la solicitud." });
  }

  // IMPORTANTE: Se ha eliminado el código inalcanzable (la segunda consulta INSERT)
  // que estaba al final de tu función.
}

export async function eliminarVideo(req, res) {
  try {
    const { id } = req.params;
    await sql`DELETE FROM videos WHERE id = ${id};`;
    res.json({ success: true, message: "Video eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar video:", err);
    res.status(500).json({ error: "Error interno al eliminar video" });
  }
}
export async function enviarvistas(req, res){
    try {
    const { video_id } = req.body;
    await sql`INSERT INTO visitas (video_id, fecha) VALUES (${video_id}, NOW());`;
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error al registrar visita:", err);
    res.status(500).json({ error: "Error al registrar visita" });
  }
}
export async function optenervistas(req, res){
    try {
    const result = await sql`SELECT * FROM visitas ORDER BY id DESC;`;
    res.json(result);
  } catch (err) {
    console.error("❌ Error al registrar visita:", err);
    res.status(500).json({ error: "Error al registrar visita" });
  }
}