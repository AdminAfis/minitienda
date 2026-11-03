import { put } from '@vercel/blob';

export default async function handler(req, res) {
  // Configurar CORS
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
    // Como estamos usando Node.js serverless tradicional con multipart, 
    // capturamos el archivo enviado desde el FormData del frontend.
    const file = req.body || req; 
    const filename = req.query.filename || `producto-${Date.now()}.jpg`;

    const blob = await put(filename, file, {
      access: 'public',
    });

    return res.status(200).json({ url: blob.url });
  } catch (error) {
    console.error("Error al subir archivo a Vercel Blob:", error);
    return res.status(500).json({ error: error.message });
  }
}
