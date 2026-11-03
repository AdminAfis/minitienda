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

    // Subimos la imagen especificando el token y el storeId explícito de tu store público
    const blob = await put(filename, req, {
      access: 'public',
      token: process.env.PUBLIC_BLOB_STORE_ID_READ_WRITE_TOKEN,
      storeId: process.env.PUBLIC_BLOB_STORE_ID_STORE_ID,
    });

    console.log("URL pública generada:", blob.url);

    return res.status(200).json({ url: blob.url });
  } catch (error) {
    console.error("Error al subir blob:", error);
    return res.status(500).json({ error: error.message });
  }
}
