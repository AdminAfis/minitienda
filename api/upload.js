import { put } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const filename = req.query.filename || `producto-${Date.now()}.jpg`;

    // Como tu Blob Store en Vercel es Privado (según la imagen 2), 
    // debemos indicarlo aquí para que coincida con los permisos del Storage.
    const blob = await put(filename, req, {
      access: 'private', 
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.status(200).json({ url: blob.url });
  } catch (error) {
    console.error("Error al subir blob:", error);
    return res.status(500).json({ error: error.message });
  }
}
