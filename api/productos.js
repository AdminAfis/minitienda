import { createClient } from '@vercel/kv';

const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(request) {
  try {
    if (request.method === 'GET') {
      let productos = await kv.get('listado_productos');
      
      if (!productos || productos.length === 0) {
        productos = [
          {
            id: "1",
            nombre: "Sneakers Urban Pro",
            categoria: "Calzado",
            precio: 180000,
            precioOferta: 149900,
            estado: "Disponible",
            descripcion: "Tenis de diseño urbano con máxima amortiguación y suela antideslizante.",
            imagenes: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600", "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600"]
          },
          {
            id: "2",
            nombre: "Reloj Inteligente Fit v2",
            precio: 120000,
            precioOferta: 99900,
            categoria: "Tecnología",
            estado: "Disponible",
            descripcion: "Smartwatch con monitor de ritmo cardíaco, notificaciones y batería de 7 días.",
            imagenes: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"]
          },
          {
            id: "3",
            nombre: "Chaqueta Impermeable Explorer",
            precio: 210000,
            precioOferta: 0,
            categoria: "Moda",
            estado: "Agotado",
            descripcion: "Chaqueta ligera cortavientos ideal para clima frío o excursiones.",
            imagenes: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600"]
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
      const body = await request.json();
      let productosActuales = await kv.get('listado_productos') || [];

      // Manejo de eliminación
      if (body.action === 'delete') {
        productosActuales = productosActuales.filter(p => p.id !== body.id);
        await kv.set('listado_productos', productosActuales);
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      // Guardar o actualizar producto por ID
      const index = productosActuales.findIndex(p => p.id === body.id);
      if (index >= 0) {
        productosActuales[index] = body;
      } else {
        productosActuales.unshift(body);
      }

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
