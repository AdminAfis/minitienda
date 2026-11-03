import { put } from '@vercel/blob';

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Método no permitido', { status: 405 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No se encontró ningún archivo' }), { status: 400 });
    }

    const nombreUnico = `productos/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    const blob = await put(nombreUnico, file, {
      access: 'public',
    });

    return new Response(JSON.stringify({ url: blob.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
