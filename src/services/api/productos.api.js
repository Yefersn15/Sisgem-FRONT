// src/services/api/productos.api.js
import * as XLSX from 'xlsx';
import { request, API_BASE_URL, getAuthToken } from './client';
import { parseBooleanCell } from './utils';
import { getCategorias } from './categorias.api';
import { getMarcas } from './marcas.api';

// Producto: Frontend -> API
const mapProductoToApi = (p) => ({
  categoria: p.categoriaId,
  marca: p.marcaId,
  nombre: p.nombre,
  descripcion: p.descripcion,
  codigo_barras: p.barcode || '',
  precio: p.precioUnitario,
  stock: p.stockDisponible,
  imagen: p.fotoUrl,
  estado: p.activo !== false,
  precio_compra: p.precioCompra,
  stock_minimo: p.minStock
});

// Producto: API -> Frontend
const mapApiToProducto = (api) => ({
  id: api.id,
  nombre: api.nombre,
  descripcion: api.descripcion,
  precioUnitario: api.precio,
  stockDisponible: api.stock,
  barcode: api.codigo_barras || '',
  fotoUrl: api.imagen || api.imagen_data,
  activo: api.estado,
  categoriaId: api.categoria?.id || api.categoria,
  marcaId: api.marca?.id || api.marca,
  precioCompra: api.precio_compra,
  minStock: api.stock_minimo,
  unidadMedida: api.unidad_medida,
  // Nombres enriquecidos
  categoriaNombre: api.categoria?.nombre,
  marcaNombre: api.marca?.nombre
});

export const getProductos = async () => {
  try {
    const data = await request('/api/productos');
    return Array.isArray(data) ? data.map(mapApiToProducto) : [];
  } catch (e) {
    console.error('Error obteniendo productos:', e);
    return [];
  }
};

export const getProductoById = async (id) => {
  const data = await request(`/api/productos/${id}`);
  return mapApiToProducto(data);
};

export const createProducto = async (producto) => {
  const payload = mapProductoToApi(producto);
  const data = await request('/api/productos', { method: 'POST', body: payload });
  return mapApiToProducto(data);
};

export const updateProducto = async (id, producto) => {
  const payload = mapProductoToApi(producto);
  const data = await request(`/api/productos/${id}`, { method: 'PUT', body: payload });
  return mapApiToProducto(data);
};

export const deleteProducto = async (id) => {
  await request(`/api/productos/${id}`, { method: 'DELETE' });
};

export const toggleProductoEstado = async (id) => {
  const producto = await getProductoById(id);
  if (producto) {
    const nuevoEstado = !producto.activo;
    return await request(`/api/productos/${id}/estado`, {
      method: 'PATCH',
      body: { estado: nuevoEstado }
    });
  }
  return null;
};

export const exportProductos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/productos/export`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'productos.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error exportando productos:', err);
  }
};

export const importProductos = async (file, onSuccess, onError) => {
  try {
    const data = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(data, { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    const categorias = await getCategorias();
    const marcas = await getMarcas();
    const categoriasIds = new Set(categorias.map(c => String(c.id)));
    const marcasIds = new Set(marcas.map(m => String(m.id)));

    let importados = 0;
    let errores = [];

    for (const row of rows) {
      try {
        const nombre = row.Nombre || row.nombre || '';
        const descripcion = row.Descripcion || row.descripcion || '';
        const precioUnitario = parseFloat(String(row.PrecioUnitario || row.precioUnitario || row.Precio || row.precio || 0).replace(',', '.'));
        const stockDisponible = parseInt(row.StockDisponible || row.stockDisponible || row.Stock || row.stock || 0, 10);
        const fotoUrl = row.FotoUrl || row.fotoUrl || row.Imagen || row.imagen || '';
        const categoriaId = String(row.CategoriaId || row.categoriaId || row.categoria || '');
        const marcaId = String(row.MarcaId || row.marcaId || row.marca || '');
        const barcode = row.CodigoBarras || row.codigoBarras || row.barcode || '';
        const activo = parseBooleanCell(row.Activo || row.activo);

        if (!nombre) throw new Error('Nombre vacío');
        if (isNaN(precioUnitario) || precioUnitario <= 0) throw new Error('Precio inválido');
        if (isNaN(stockDisponible) || stockDisponible < 0) throw new Error('Stock inválido');
        if (!categoriaId || !categoriasIds.has(categoriaId)) throw new Error(`Categoría ID ${categoriaId} no existe`);
        if (!marcaId || !marcasIds.has(marcaId)) throw new Error(`Marca ID ${marcaId} no existe`);

        await createProducto({
          nombre,
          descripcion,
          precioUnitario,
          stockDisponible,
          fotoUrl,
          categoriaId: parseInt(categoriaId, 10),
          marcaId: parseInt(marcaId, 10),
          barcode,
          activo
        });
        importados++;
      } catch (err) {
        errores.push(`Fila ${rows.indexOf(row) + 2}: ${err.message}`);
      }
    }

    if (onSuccess) onSuccess(importados, errores);
    if (errores.length > 0 && onError) onError(errores);
  } catch (err) {
    if (onError) onError([err.message]);
    console.error('Error importando productos:', err);
  }
};
