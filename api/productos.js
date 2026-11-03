import { createClient } from '@vercel/kv';

const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(request) {
  try {
    if (request.method === 'GET') {
      // 1. Intentar traer los productos de la nube
      let productos = await kv.get('listado_productos');
      
      // 2. Si la base de datos está vacía, inicializarla con tus 3 productos de prueba originales para que la tienda no se vea en blanco
      if (!productos || productos.length === 0) {
        productos = [
          {
            id: "1",
            nombre: "Sneakers Urban Pro",
            categoria: "Calzado",
            precio: 149900,
            estado: "Disponible",
            descripcion: "Tenis de diseño urbano con máxima amortiguación y suela antideslizante.",
            imagenes: ["https://unsplash.com"]
          },
          {
            id: "2",
            nombre: "Reloj Inteligente Fit v2",
            categoria: "Tecnología",
            precio: 99900,
            estado: "Disponible",
            descripcion: "Smartwatch con monitor de ritmo cardíaco, notificaciones y batería de 7 días.",
            imagenes: ["https://unsplash.com"]
          },
          {
            id: "3",
            nombre: "Chaqueta Impermeable Explorer",
            categoria: "Moda",
            precio: 210000,
            estado: "Agotado",
            descripcion: "Chaqueta ligera cortavientos ideal para clima frío o excursiones.",
            imagenes: ["https://unsplash.com"]
          }
        ];
        await kv.set('listado_productos', productos);
      }
      
      return new Response(JSON.stringify(productos), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'POST') {
      const nuevoProducto = await request.json();
      const productosActuales = await kv.get('listado_productos') || [];
      
      productosActuales.unshift(nuevoProducto);
      await kv.set('listado_productos', productosActuales);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Método no permitido', { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
