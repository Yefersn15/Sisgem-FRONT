// src/services/api/dashboard.api.js
import { request } from './client';

export const getDashboardStats = async () => {
  const data = await request('/api/dashboard');
  return data;
};

// Las tres funciones de abajo reciben `ventas`/`productos`/`marcas`/
// `categorias` ya cargados en vez de pedirlos ellas mismas: antes cada una
// volvía a llamar getVentas()/getProductos()/getMarcas()/getCategorias() por
// su cuenta, así que abrir el dashboard disparaba esas mismas listas
// completas 3-4 veces en paralelo (con lo grande que es el catálogo, eso
// bastaba para gatillar el límite de solicitudes del backend). Ahora
// useDashboardStats.js las trae una sola vez y se las pasa a las tres.
export const getTopProductos = (ventas, take = 10) => {
  const detalleVentas = ventas.flatMap(v => v.productos || []);
  const grouped = detalleVentas.reduce((acc, det) => {
    const key = det.productoId || det.productoSnapshot?.nombre || 'desconocido';
    if (!acc[key]) {
      acc[key] = {
        productoId: det.productoId,
        nombre: det.productoSnapshot?.nombre || 'Producto',
        cantidad: 0,
        total: 0,
      };
    }
    acc[key].cantidad += det.cantidad || 0;
    acc[key].total += det.subtotal || 0;
    return acc;
  }, {});
  return Object.values(grouped).sort((a, b) => b.cantidad - a.cantidad).slice(0, take);
};

export const getTopByBrand = (ventas, productos, marcas, take = 10) => {
  const detalleVentas = ventas.flatMap(v => v.productos || []);
  const grouped = {};
  detalleVentas.forEach(det => {
    const producto = productos.find(p => p.id === det.productoId);
    const marcaId = producto?.marcaId;
    if (!marcaId) return;
    if (!grouped[marcaId]) {
      const marca = marcas.find(m => m.id === marcaId);
      grouped[marcaId] = { marcaId, nombre: marca?.nombre || 'Sin marca', cantidad: 0, total: 0 };
    }
    grouped[marcaId].cantidad += det.cantidad || 0;
    grouped[marcaId].total += det.subtotal || 0;
  });
  return Object.values(grouped).sort((a, b) => b.cantidad - a.cantidad).slice(0, take);
};

export const getTopByCategory = (ventas, productos, categorias, take = 10) => {
  const detalleVentas = ventas.flatMap(v => v.productos || []);
  const grouped = {};
  detalleVentas.forEach(det => {
    const producto = productos.find(p => p.id === det.productoId);
    const catId = producto?.categoriaId;
    if (!catId) return;
    if (!grouped[catId]) {
      const cat = categorias.find(c => c.id === catId);
      grouped[catId] = { categoriaId: catId, nombre: cat?.nombre || 'Sin categoría', cantidad: 0, total: 0 };
    }
    grouped[catId].cantidad += det.cantidad || 0;
    grouped[catId].total += det.subtotal || 0;
  });
  return Object.values(grouped).sort((a, b) => b.cantidad - a.cantidad).slice(0, take);
};
