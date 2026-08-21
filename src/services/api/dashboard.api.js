// src/services/api/dashboard.api.js
import { request } from './client';
import { getVentas } from './pedidos.api';
import { getProductos } from './productos.api';
import { getMarcas } from './marcas.api';
import { getCategorias } from './categorias.api';

export const getDashboardStats = async () => {
  const data = await request('/api/dashboard');
  return data;
};

export const getTopProductos = async (take = 10) => {
  const ventas = await getVentas();
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

export const getTopByBrand = async (take = 10) => {
  const ventas = await getVentas();
  const productos = await getProductos();
  const marcas = await getMarcas();
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

export const getTopByCategory = async (take = 10) => {
  const ventas = await getVentas();
  const productos = await getProductos();
  const categorias = await getCategorias();
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
