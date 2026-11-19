import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            // Compatibilidad total: Busca productos en ambas llaves de la base de datos
            let products = (await kv.get('listado_productos')) || (await kv.get('products')) || [];
            
            // Si no hay productos en ninguna, cargamos los por defecto
            if (!products || products.length === 0) {
                products = [
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
                await kv.set('listado_productos', products);
            }

            const config = (await kv.get('config')) || null;
            const categories = (await kv.get('categories')) || null;
            
            return res.status(200).json({ products, config, categories });
        }

        if (req.method === 'POST') {
            const body = req.body;

            // Guardar configuración global o categorías en tiempo real
            if (body.action === 'saveGlobalData') {
                if (body.config) await kv.set('config', body.config);
                if (body.categories) await kv.set('categories', body.categories);
                return res.status(200).json({ success: true });
            }

            // Eliminar producto actualizando ambas llaves por seguridad
            if (body.action === 'delete') {
                let products = (await kv.get('listado_productos')) || (await kv.get('products')) || [];
                products = products.filter(p => p.id !== body.id);
                await kv.set('listado_productos', products);
                await kv.set('products', products);
                return res.status(200).json({ success: true });
            }

            // Guardar o actualizar producto individual en tiempo real
            const newProduct = body;
            let products = (await kv.get('listado_productos')) || (await kv.get('products')) || [];
            const index = products.findIndex(p => p.id === newProduct.id);

            if (index >= 0) {
                products[index] = newProduct;
            } else {
                products.unshift(newProduct);
            }

            await kv.set('listado_productos', products);
            await kv.set('products', products);
            return res.status(200).json({ success: true, product: newProduct });
        }

        return res.status(405).json({ error: 'Método no permitido' });
    } catch (error) {
        console.error("Error en API productos:", error);
        return res.status(500).json({ error: error.message });
    }
}
