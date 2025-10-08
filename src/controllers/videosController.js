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

export async function agregarVideo(req, res) {
  try {
    const { url } = req.body;
    const title = await obtenerTitulo(url);
    
        let embedUrl = url;
        if (url.includes("youtube") || url.includes("youtu.be")) {
          const id = url.split("v=")[1] || url.split("/").pop();
          embedUrl = `https://www.youtube.com/embed/${id}`;
        } else if (url.includes("dailymotion")) {
          const id = url.split("/video/")[1];
          embedUrl = `https://www.dailymotion.com/embed/video/${id}`;
        }
    
        const [video] = await sql`
          INSERT INTO videos (url, title, platform, embed_url)
          VALUES (${url}, ${title}, 'auto', ${embedUrl})
          RETURNING *;
        `;
    
        res.json(video);
      } catch (err) {
        console.error("❌ Error al agregar video:", err);
        res.status(500).json({ error: err.message });
      }
    if (!titulo || !url) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }
    await sql`
      INSERT INTO videos (titulo, url, fecha_subida)
      VALUES (${titulo}, ${url}, NOW());
    `;
    res.json({ success: true, message: "Video agregado correctamente" });
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