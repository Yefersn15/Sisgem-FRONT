// src/services/dataService.js
// Servicio de datos para conectar con la API REST de SISGEM
// No usa localStorage - solo conexión API remota

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// ----------------------------------------------------------------------
// Configuración de API
// ----------------------------------------------------------------------
// La API base URL - usar variable de entorno VITE_API_BASE_URL en Vite
// Fallback a localhost:3000 si no hay variable de entorno
const getApiBaseUrl = () => {
  //优先使用本地开发服务器地址
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // 开发环境默认使用本地API
  if (import.meta.env.DEV) {
    return 'http://localhost:3000';
  }
  return 'https://sisgem-api.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();
export const USE_REMOTE_API = import.meta.env.VITE_USE_REMOTE_API === 'true';

// Obtener token de autenticación
const getAuthToken = () => {
  try {
    return localStorage.getItem('auth_token');
  } catch (e) {
    return null;
  }
};

// ----------------------------------------------------------------------
// Función request - Cliente HTTP para la API
// ----------------------------------------------------------------------
export const request = async (path, options = {}) => {
  const url = path.startsWith('http') ? path : `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const opts = {
    ...options,
    headers
  };

  if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
    opts.body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, opts);
  
  if (!res.ok) {
    let txt = '';
    try {
      txt = await res.text();
    } catch (e) {
      txt = 'No se pudo leer el cuerpo de la respuesta';
    }
    // No borrar token automáticamente en 401/400 - el usuario puede re-autenticarse si es necesario
    const err = new Error(`API error ${res.status} ${res.statusText}: ${txt}`);
    err.status = res.status;
    throw err;
  }

  let text = '';
  try {
    text = await res.text();
  } catch (e) {
    throw new Error('No se pudo leer la respuesta del servidor');
  }
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  // La API retorna { success: true, message, data }
  if (data && data.success !== undefined) {
    if (!data.success) {
      const err = new Error(data.message || 'Error en la API');
      err.status = res.status;
      throw err;
    }
    return data.data; // Retornamos solo data
  }
  
  return data;
};

// ----------------------------------------------------------------------
// Utilidades
// ----------------------------------------------------------------------
export const formatPrice = (value, options = {}) => {
  const v = Math.round(Number(value) || 0);
  const withSymbol = options.withSymbol !== false;
  const s = v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return withSymbol ? `$${s}` : s;
};

const parseBooleanCell = (val) => {
  if (val === undefined || val === null) return false;
  const s = String(val).trim().toLowerCase();
  return ['sí', 'si', 'true', 'verdadero', '1', 'yes', 'activo'].includes(s);
};

const parseDateCellToISO = (val) => {
  if (!val) return new Date().toISOString();
  if (val instanceof Date) return val.toISOString();
  const s = String(val).trim();
  const normalized = s.replace(',', ' ').replace(/\s+/g, ' ').trim();
  const parsed = Date.parse(normalized);
  if (!isNaN(parsed)) return new Date(parsed).toISOString();
  const match = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[\sT,](\d{1,2}):(\d{1,2}))?/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    const hour = match[4] ? parseInt(match[4], 10) : 0;
    const minute = match[5] ? parseInt(match[5], 10) : 0;
    return new Date(year, month, day, hour, minute).toISOString();
  }
  return new Date().toISOString();
};

const formatDateForExport = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return iso;
  }
};

export const exportToExcel = (data, filename = 'datos.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, filename);
};

// ----------------------------------------------------------------------
// Mapeos entre frontend y API
// ----------------------------------------------------------------------

// Producto: Frontend -> API
const mapProductoToApi = (p) => ({
  categoria: p.categoriaId,
  marca: p.marcaId,
  proveedor: p.proveedorId,
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
  proveedorId: api.proveedor?.id || api.proveedor,
  precioCompra: api.precio_compra,
  minStock: api.stock_minimo,
  unidadMedida: api.unidad_medida,
  // Nombres enriquecidos
  categoriaNombre: api.categoria?.nombre,
  marcaNombre: api.marca?.nombre,
  proveedorNombre: api.proveedor?.nombre
});

// Categoría: Frontend -> API
const mapCategoriaToApi = (c) => ({
  nombre: c.nombre,
  descripcion: c.descripcion,
  foto_url: c.imagen,
  estado: c.activa !== undefined ? c.activa : true
});

// Categoría: API -> Frontend
const mapApiToCategoria = (api) => ({
  id: api.id,
  nombre: api.nombre,
  descripcion: api.descripcion,
  imagen: api.fotoUrl || api.foto_url || api.foto_data,
  activo: api.estado
});

// Marca: Frontend -> API
const mapMarcaToApi = (m) => ({
  nombre: m.nombre,
  descripcion: m.descripcion,
  logo: m.logoUrl,
  sitio_web: m.sitioWeb,
  proveedor_id: m.proveedorId,
  estado: m.activo !== undefined ? m.activo : true
});

// Marca: API -> Frontend
const mapApiToMarca = (api) => ({
  id: api.id,
  nombre: api.nombre,
  descripcion: api.descripcion,
  logoUrl: api.logo || api.logo_data,
  sitioWeb: api.sitio_web || '',
  proveedorId: api.proveedor?.id || api.proveedorId || api.proveedor_id,
  activo: api.estado
});

// Proveedor: Frontend -> API
const mapProveedorToApi = (p) => ({
  nombre: p.nombre,
  nit: p.documento,
  tipo_persona: p.tipoPersona,
  tipo_documento: p.tipoDocumento,
  telefono: p.telefono,
  telefono_pais: p.telefonoPais,
  email: p.email,
  direccion: p.direccion,
  contacto: p.contacto,
  rubro: p.rubro,
  logo: p.logoUrl,
  estado: p.estado !== false
});

// Proveedor: API -> Frontend
const mapApiToProveedor = (api) => ({
  id: api._id,
  nombre: api.nombre,
  documento: api.nit,
  tipoPersona: api.tipo_persona,
  tipoDocumento: api.tipo_documento,
  telefono: api.telefono,
  telefonoPais: api.telefono_pais,
  email: api.email,
  direccion: api.direccion,
  contacto: api.contacto,
  rubro: api.rubro,
  logoUrl: api.logo,
  estado: api.estado
});

// ----------------------------------------------------------------------
// PRODUCTOS
// ----------------------------------------------------------------------
export const getProductos = async () => {
  const data = await request('/api/productos');
  return Array.isArray(data) ? data.map(mapApiToProducto) : [];
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

// ----------------------------------------------------------------------
// CATEGORÍAS
// ----------------------------------------------------------------------
export const getCategorias = async () => {
  const data = await request('/api/categorias');
  return Array.isArray(data) ? data.map(mapApiToCategoria) : [];
};

export const getCategoriaById = async (id) => {
  const data = await request(`/api/categorias/${id}`);
  return mapApiToCategoria(data);
};

export const createCategoria = async (categoria) => {
  const payload = mapCategoriaToApi(categoria);
  const data = await request('/api/categorias', { method: 'POST', body: payload });
  return mapApiToCategoria(data);
};

export const updateCategoria = async (id, categoria) => {
  const payload = mapCategoriaToApi(categoria);
  const data = await request(`/api/categorias/${id}`, { method: 'PUT', body: payload });
  return mapApiToCategoria(data);
};

export const deleteCategoria = async (id) => {
  await request(`/api/categorias/${id}`, { method: 'DELETE' });
};

export const toggleCategoriaEstado = async (id) => {
  const categoria = await getCategoriaById(id);
  if (categoria) {
    return await request(`/api/categorias/${id}/estado`, { 
      method: 'PATCH', 
      body: { estado: !categoria.activo } 
    });
  }
  return null;
};

export const exportCategorias = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categorias/export`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'categorias.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error exportando categorías:', err);
  }
};

export const importCategorias = async (file, onSuccess, onError) => {
  try {
    const data = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(data, { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    for (const row of rows) {
      const nombre = row.Nombre || row.nombre || '';
      const descripcion = row.Descripcion || row.descripcion || '';
      const activo = parseBooleanCell(row.Activo || row.activo);
      if (nombre) {
        await createCategoria({ nombre, descripcion, activo });
      }
    }
    onSuccess && onSuccess(rows.length);
  } catch (err) {
    onError && onError(err);
    console.error('Error importando categorías:', err);
  }
};

// ----------------------------------------------------------------------
// MARCAS
// ----------------------------------------------------------------------
export const getMarcas = async () => {
  const data = await request('/api/marcas');
  return Array.isArray(data) ? data.map(mapApiToMarca) : [];
};

export const getMarcaById = async (id) => {
  const data = await request(`/api/marcas/${id}`);
  return mapApiToMarca(data);
};

export const createMarca = async (marca) => {
  const payload = mapMarcaToApi(marca);
  const data = await request('/api/marcas', { method: 'POST', body: payload });
  return mapApiToMarca(data);
};

export const updateMarca = async (id, marca) => {
  const payload = mapMarcaToApi(marca);
  const data = await request(`/api/marcas/${id}`, { method: 'PUT', body: payload });
  return mapApiToMarca(data);
};

export const deleteMarca = async (id) => {
  await request(`/api/marcas/${id}`, { method: 'DELETE' });
};

export const toggleMarcaEstado = async (id) => {
  const marca = await getMarcaById(id);
  if (marca) {
    return await request(`/api/marcas/${id}/estado`, { 
      method: 'PATCH', 
      body: { estado: !marca.activo } 
    });
  }
  return null;
};

export const exportMarcas = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/marcas/export`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'marcas.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error exportando marcas:', err);
  }
};

export const importMarcas = async (file, onSuccess, onError) => {
  try {
    const data = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(data, { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    for (const row of rows) {
      // Campos del Excel: Id, Nombre, Descripcion, LogoUrl, Activo, SitioWeb
      const nombre = row.Nombre || row.nombre || '';
      const descripcion = row.Descripcion || row.descripcion || '';
      const logoUrl = row.LogoUrl || row.logoUrl || row.Logo || row.logo || row.Imagen || row.imagen || '';
      const sitioWeb = row.SitioWeb || row.sitioWeb || '';
      const activo = parseBooleanCell(row.Activo || row.activo);
      if (nombre) {
        await createMarca({ nombre, descripcion, logoUrl, sitioWeb, activo });
      }
    }
    onSuccess && onSuccess(rows.length);
  } catch (err) {
    onError && onError(err);
  }
};

// ----------------------------------------------------------------------
// PROVEEDORES
// ----------------------------------------------------------------------
export const getProveedores = async () => {
  const data = await request('/api/proveedores');
  return Array.isArray(data) ? data.map(mapApiToProveedor) : [];
};

export const getProveedorById = async (id) => {
  const data = await request(`/api/proveedores/${id}`);
  return mapApiToProveedor(data);
};

export const createProveedor = async (proveedor) => {
  const payload = mapProveedorToApi(proveedor);
  const data = await request('/api/proveedores', { method: 'POST', body: payload });
  return mapApiToProveedor(data);
};

export const updateProveedor = async (id, proveedor) => {
  const payload = mapProveedorToApi(proveedor);
  const data = await request(`/api/proveedores/${id}`, { method: 'PUT', body: payload });
  return mapApiToProveedor(data);
};

export const deleteProveedor = async (id) => {
  await request(`/api/proveedores/${id}`, { method: 'DELETE' });
};

export const toggleProveedorEstado = async (id) => {
  const proveedor = await getProveedorById(id);
  if (proveedor) {
    return await request(`/api/proveedores/${id}/estado`, { 
      method: 'PATCH', 
      body: { estado: !proveedor.estado } 
    });
  }
  return null;
};

export const exportProveedores = async () => {
  const proveedores = await getProveedores();
  const data = proveedores.map(p => ({
    Id: p.id,
    Nombre: p.nombre,
    Documento: p.documento,
    Telefono: p.telefono,
    Email: p.email,
    Direccion: p.direccion,
    Contacto: p.contacto,
    Estado: p.estado ? 'Activo' : 'Inactivo'
  }));
  exportToExcel(data, 'proveedores.xlsx');
};

export const importProveedores = async (file, onSuccess, onError) => {
  try {
    const data = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(data, { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    for (const row of rows) {
      // Campos del Excel: Id, Tipo Persona, Tipo Documento, Documento, Nombre, Contacto, Teléfono, TelefonoPais, Email, Dirección, Rubro, LogoUrl, Estado
      const nombre = row.Nombre || row.nombre || '';
      const documento = row.Documento || row.documento || '';
      const tipoPersona = row['Tipo Persona'] || row.tipoPersona || 'Natural';
      const tipoDocumento = row['Tipo Documento'] || row.tipoDocumento || 'CC';
      const telefono = row.Teléfono || row.telefono || row.Telefono || '';
      const telefonoPais = row.TelefonoPais || row.telefonoPais || '';
      const email = row.Email || row.email || '';
      const direccion = row.Dirección || row.direccion || row.Direccion || '';
      const contacto = row.Contacto || row.contacto || '';
      const rubro = row.Rubro || row.rubro || '';
      const logoUrl = row.LogoUrl || row.logoUrl || '';
      const estado = parseBooleanCell(row.Estado || row.estado);
      if (nombre && documento) {
        await createProveedor({ 
          nombre, 
          documento, 
          tipoPersona, 
          tipoDocumento, 
          telefono, 
          telefonoPais, 
          email, 
          direccion, 
          contacto, 
          rubro, 
          logoUrl, 
          estado 
        });
      }
    }
    onSuccess && onSuccess(rows.length);
  } catch (err) {
    onError && onError(err);
  }
};

// ----------------------------------------------------------------------
// CLIENTES - DEPRECATED: Los clientes ahora son usuarios
// ----------------------------------------------------------------------
// La función getClientes ha sido eliminada porque el backend ya no tiene la ruta /api/clientes
// Los clientes ahora se manejan a través de la tabla de usuarios

// ----------------------------------------------------------------------
// PEDIDOS (VENTAS)
// ----------------------------------------------------------------------

// Mapeo interno
const mapPedidoToFront = (pedido) => {
  let telefonoDir = '';
  let direccion = '';
  let barrio = '';
  let tipoDir = '';
  
  if (pedido.direccion) {
    if (typeof pedido.direccion === 'object') {
      direccion = pedido.direccion.direccion || '';
      barrio = pedido.direccion.barrio || '';
      telefonoDir = pedido.direccion.telefono || '';
      tipoDir = pedido.direccion.tipo || '';
    } else if (typeof pedido.direccion === 'string') {
      try {
        const dirObj = JSON.parse(pedido.direccion);
        direccion = dirObj.direccion || '';
        barrio = dirObj.barrio || '';
        telefonoDir = dirObj.telefono || '';
        tipoDir = dirObj.tipo || '';
      } catch {
        direccion = pedido.direccion;
      }
    }
  }
  
  // Leer tipo_venta correctamente (puede venir como tipoVenta o tipo_venta)
  const tipoVenta = pedido.tipoVenta || pedido.tipo_venta || 'mostrador';
  
  return {
    id: pedido.id,
    fecha: pedido.createdAt || pedido.fecha_pedido,
    usuarioId: typeof pedido.usuario === 'object' ? pedido.usuario?.id : (pedido.usuarioId || pedido.usuario),
    usuarioNombre: typeof pedido.usuario === 'object' ? `${pedido.usuario?.nombre || ''} ${pedido.usuario?.apellido || ''}`.trim() : undefined,
    usuarioDocumento: typeof pedido.usuario === 'object' ? pedido.usuario?.documento : undefined,
    telefono: pedido.telefonoContacto || pedido.telefono_contacto || telefonoDir || '',
    metodoPago: pedido.metodoPago || pedido.metodo_pago || 'Efectivo',
    subtotal: parseFloat(pedido.subtotal) || 0,
    shipping: (parseFloat(pedido.total) || 0) - (parseFloat(pedido.subtotal) || 0),
    total: parseFloat(pedido.total) || 0,
    estadoPedido: pedido.estadoPedido || pedido.estado_pedido || 'Pendiente',
    estadoVenta: pedido.estadoVenta || pedido.estado_venta || null,
    esVenta: pedido.esVenta ?? pedido.es_venta,
    tipo_venta: tipoVenta,
    delivery: tipoVenta === 'domicilio',
    observaciones: pedido.observaciones,
    direccion,
    barrio,
    tipo: tipoDir,
    telefonoDir,
    telefonoContacto: pedido.telefonoContacto || pedido.telefono_contacto,
    productos: (pedido.productos || []).map(item => ({
      productoId: typeof item.producto === 'object' ? item.producto?.id : item.producto,
      cantidad: item.cantidad,
      precioUnitario: item.precio_unitario || item.precioUnitario,
      subtotal: item.subtotal,
      productoSnapshot: item.producto ? {
        nombre: item.producto.nombre,
        fotoUrl: item.producto.imagen,
        codigoBarras: item.producto.codigo_barras
      } : null
    }))
  };
};

// Obtener pedidos activos (no ventas)
export const getPedidos = async () => {
  try {
    const data = await request('/api/pedidos');
    return Array.isArray(data) ? data.map(mapPedidoToFront) : [];
  } catch (e) {
    console.error('Error obteniendo pedidos:', e);
    return [];
  }
};

// Obtener mis pedidos y ventas (cliente)
export const getMisPedidos = async () => {
  try {
    const data = await request('/api/pedidos/mis-pedidos');
    return Array.isArray(data) ? data.map(mapPedidoToFront) : [];
  } catch (e) {
    console.error('Error obteniendo mis pedidos:', e);
    return [];
  }
};

// Obtener ventas
export const getVentas = async () => {
  try {
    const data = await request('/api/pedidos/ventas');
    return Array.isArray(data) ? data.map(mapPedidoToFront) : [];
  } catch (e) {
    console.error('Error obteniendo ventas:', e);
    return [];
  }
};

// Obtener pedido/venta por ID
export const getVentaById = async (id) => {
  const data = await request(`/api/pedidos/${id}`);
  return mapPedidoToFront(data);
};

// Crear pedido
export const createPedido = async (pedidoData) => {
  // Aceptar tanto nombres "frontend" como ya-mapeados del checkout
  const payload = {
    usuario: pedidoData.usuarioId || pedidoData.usuario,
    tipo_venta: pedidoData.tipo_venta || pedidoData.tipoVenta || (pedidoData.delivery ? 'domicilio' : 'mostrador'),
    productos: pedidoData.productos?.map(item => ({
      producto: item.producto || item.productoId || item.producto?._id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario || item.precioUnitario || item.precio
    })) || [],
    subtotal: pedidoData.subtotal,
    total: pedidoData.total,
    observaciones: pedidoData.observaciones,
    metodo_pago: pedidoData.metodo_pago || pedidoData.metodoPago,
    telefono_contacto: pedidoData.telefono_contacto || pedidoData.telefono || pedidoData.telefonoContacto,
    direccion: pedidoData.direccion ? (typeof pedidoData.direccion === 'string' ? {
      direccion: pedidoData.direccion,
      barrio: pedidoData.barrio,
      telefono: pedidoData.telefono || pedidoData.telefono_contacto
    } : {
      direccion: pedidoData.direccion.direccion || pedidoData.direccion,
      barrio: pedidoData.direccion.barrio || pedidoData.barrio,
      telefono: pedidoData.direccion.telefono || pedidoData.telefono || pedidoData.telefono_contacto
    }) : undefined
  };
  const data = await request('/api/pedidos', { method: 'POST', body: payload });
  return data;
};

// Crear venta (crea pedido y lo convierte si no es abono)
export const createVenta = async (ventaData) => {
  try {
    // Crear un pedido primero (es_venta false)
    const pedido = await createPedido(ventaData);
    if (pedido && pedido._id) {
      // Si no es abono, convertir inmediatamente a venta
      if (ventaData.metodoPago !== 'Abono') {
        await convertirPedidoAVenta(pedido._id);
        return await getVentaById(pedido._id);
      }
      return pedido; // todavía es pedido, se convertirá después
    }
    return pedido;
  } catch (err) {
    console.error('Error creating venta:', err);
    throw err;
  }
};

// Cambiar estado de pedido
export const cambiarEstadoPedido = async (id, estadoPedido) => {
  return await request(`/api/pedidos/${id}/estado`, { method: 'PATCH', body: { estado_pedido: estadoPedido } });
};

// Avanzar estado de pedido
export const cambiarEstado = async (id, estadoPedido) => {
  return await request(`/api/pedidos/${id}/estado`, { method: 'PATCH', body: { estado_pedido: estadoPedido } });
};

// Convertir pedido a venta
export const convertirPedidoAVenta = async (id) => {
  return await request(`/api/pedidos/${id}/convertir-venta`, { method: 'POST' });
};

// Actualizar pedido
export const updateVenta = async (id, venta) => {
  const { usuarioId, ...rest } = venta;
  const data = await request(`/api/pedidos/${id}`, { method: 'PUT', body: rest });
  return data;
};

// Eliminar pedido
export const deleteVenta = async (id) => {
  await request(`/api/pedidos/${id}`, { method: 'DELETE' });
};

// ----------------------------------------------------------------------
// PAGOS
// ----------------------------------------------------------------------
export const getPagos = async () => {
  try {
    const data = await request('/api/pagos');
    return Array.isArray(data) ? data.map(pago => {
      const ventaId = typeof pago.pedido === 'object' ? pago.pedido?.id : pago.pedido;
      const usuarioObj = pago.pedido?.usuario;
      const usuarioId = usuarioObj?.id || pago.pedido?.usuario;
      const usuarioNombre = usuarioObj ? `${usuarioObj.nombre || ''} ${usuarioObj.apellido || ''}`.trim() : undefined;
      const usuarioDocumento = usuarioObj?.documento;
      return {
        id: pago.id,
        ventaId,
        usuarioId,
        usuarioNombre,
        usuarioDocumento,
        monto: pago.monto,
        metodo: pago.metodo,
        referencia: pago.referencia,
        estado: pago.estado,
        fecha: pago.fecha_pago || pago.created_at || pago.createdAt,
        notas: pago.observaciones
      };
    }) : [];
  } catch (e) {
    console.error('Error obteniendo pagos:', e);
    return [];
  }
};

export const getPagoById = async (id) => {
  const data = await request(`/api/pagos/${id}`);
  if (!data) return null;
  const ventaId = typeof data.pedido === 'object' ? (data.pedido?.id || data.pedido?._id) : data.pedido;
  const usuarioObj = data.pedido?.usuario;
  const usuarioNombre = usuarioObj ? `${usuarioObj.nombre || ''} ${usuarioObj.apellido || ''}`.trim() : undefined;
  const usuarioDocumento = usuarioObj?.documento;
  return {
    id: data.id || data._id,
    ventaId,
    usuarioNombre,
    usuarioDocumento,
    monto: parseFloat(data.monto) || 0,
    metodo: data.metodo,
    estado: data.estado,
    fecha: data.fecha_pago || data.created_at || data.createdAt,
    notas: data.observaciones
  };
};

export const createPago = async (pago) => {
  let metodoNormalizado = (pago.metodo || '').toLowerCase();
  if (metodoNormalizado === 'abono') metodoNormalizado = 'efectivo';
  if (!['efectivo', 'transferencia'].includes(metodoNormalizado)) {
    metodoNormalizado = 'efectivo';
  }

  const payload = {
    pedidoId: parseInt(pago.ventaId) || 0,
    monto: parseFloat(pago.monto) || 0,
    metodo: metodoNormalizado,
    estado: pago.estado || (pago.tipo === 'abono' ? 'Pendiente' : 'aplicado'),
    observaciones: pago.notas,
    tipo: pago.tipo || 'pago_total'
  };
  const data = await request('/api/pagos', { method: 'POST', body: payload });
  return data;
};

export const updatePago = async (id, pago) => {
  const data = await request(`/api/pagos/${id}`, { method: 'PUT', body: pago });
  return data;
};

export const deletePago = async (id) => {
  await request(`/api/pagos/${id}`, { method: 'DELETE' });
};

export const cambiarEstadoPago = async (id, estado) => {
  return await request(`/api/pagos/${id}/estado`, { method: 'PATCH', body: { estado } });
};

// ----------------------------------------------------------------------
// DOMICILIOS
// ----------------------------------------------------------------------
export const getDomicilios = async () => {
  try {
    // Obtener domicilios reales y complementar con pedidos de tipo 'domicilio' que aún no tienen domicilio creado
    const domiciliosData = await request('/api/domicilios');
    const pedidosData = await request('/api/pedidos');

    const domicilios = Array.isArray(domiciliosData) ? domiciliosData.map(dom => {
      // normalizar id de pedido
      const pedidoId = dom.pedido?.id || dom.pedido || dom.pedidoId || null;

      // normalizar repartidor (puede ser string o objeto)
      let repartidorObj = null;
      if (dom.repartidor) {
        if (typeof dom.repartidor === 'object') {
          repartidorObj = {
            nombre: dom.repartidor.nombre || dom.repartidor.nombreCompleto || dom.repartidor,
            telefono: dom.repartidor.telefono || dom.repartidor.phone || dom.telefono_repartidor || '',
            tipoVehiculo: dom.repartidor.tipoVehiculo || dom.tipoVehiculo || '',
            placa: dom.repartidor.placa || dom.placa || ''
          };
        } else {
          repartidorObj = { nombre: dom.repartidor, telefono: dom.telefono_repartidor || '', tipoVehiculo: dom.tipoVehiculo || '', placa: dom.placa || '' };
        }
      }

      const domDir = dom.direccion ? (typeof dom.direccion === 'object' ? dom.direccion : { direccion: dom.direccion, direccion2: dom.direccion2, barrio: dom.barrio }) : { direccion: '', direccion2: '', barrio: '' };
    const pedidoDir = dom.pedido?.direccion ? (typeof dom.pedido.direccion === 'object' ? dom.pedido.direccion : { tipo: '' }) : { direccion: '', tipo: '' };
    const resTipo = domDir.tipo || pedidoDir.tipo || '';
    const pedidoEstado = dom.pedido?.estado_pedido || dom.pedido?.estadoPedido || 'pendiente';
    const pedidoMetodo = dom.pedido?.metodo_pago || dom.pedido?.metodoPago || 'Efectivo';
    const pedidoUsuario = dom.pedido?.usuario?.nombre || dom.pedido?.usuarioNombre || '';
    
    return ({
        id: dom.id,
        pedidoId: pedidoId,
        ventaId: pedidoId,
        direccion: dom.direccion || domDir.direccion || '',
        direccion2: dom.direccion2 || domDir.direccion2 || '',
        barrio: dom.barrio || domDir.barrio || '',
        ciudad: dom.ciudad || '',
        telefono: dom.telefono || '',
        estado: dom.estado || 'Pendiente',
        tipo: resTipo,
        tarifa: (dom.tarifaAplicada ?? dom.tarifa_aplicada ?? dom.tarifa) ?? 0,
        repartidor: repartidorObj,
        notas: dom.notas || '',
        venta: {
          id: dom.pedido?.id,
          estadoPedido: pedidoEstado,
          metodoPago: pedidoMetodo,
          usuarioNombre: pedidoUsuario,
          direccion: dom.pedido?.direccion,
          telefono: dom.pedido?.telefono_contacto
        }
      });
    }) : [];

    const pedidos = Array.isArray(pedidosData) ? pedidosData : [];

    // Añadir pedidos de tipo domicilio que no tengan Domicilio creado
    const pedidosDomicilio = pedidos
      .filter(p => p.tipo_venta === 'domicilio')
      .filter(p => !domicilios.find(d => String(d.pedidoId) === String(p.id)))
      .map(p => {
        const direccionStr = (typeof p.direccion === 'string') ? p.direccion : (p.direccion && typeof p.direccion === 'object' ? (p.direccion.direccion || '') : '');
        const barrioStr = (p.direccion && typeof p.direccion === 'object') ? (p.direccion.barrio || '') : '';
        const ciudadStr = (p.direccion && typeof p.direccion === 'object') ? (p.direccion.ciudad || '') : '';
        const telefonoStr = p.telefono_contacto || (p.direccion && p.direccion.telefono) || '';
        const tipoStr = (p.direccion && typeof p.direccion === 'object') ? (p.direccion.tipo || '') : '';
        return ({
          id: `pedido-${p.id}`,
          pedidoId: p.id,
          ventaId: p.id,
          direccion: direccionStr,
          direccion2: (p.direccion && typeof p.direccion === 'object') ? (p.direccion.direccion2 || '') : '',
          barrio: barrioStr,
          ciudad: ciudadStr,
          telefono: telefonoStr,
          estado: p.estado_pedido || 'Pendiente',
          tipo: tipoStr,
          tarifa: 0,
          repartidor: null,
          notas: p.observaciones || ''
        });
      });

    return [...pedidosDomicilio, ...domicilios];
  } catch (e) {
    console.error('Error obteniendo domicilios:', e);
    return [];
  }
};

export const getDomicilioByVentaId = async (ventaId) => {
  if (ventaId === 'all') {
    const todos = await getDomicilios();
    return todos;
  }
  const domicilios = await getDomicilios();
  return domicilios.find(d => String(d.pedidoId) === String(ventaId) || String(d.ventaId) === String(ventaId));
};

export const updateDomicilioEstado = async (ventaId, estado, forzar = false) => {
  const dom = await getDomicilioByVentaId(ventaId);
  if (dom) {
    const endpoint = forzar ? `/api/domicilios/${dom.id}/convertir` : `/api/domicilios/${dom.id}/estado`;
    return await request(endpoint, { method: 'PATCH', body: { estado, forzar } });
  }
  return null;
};

// ----------------------------------------------------------------------
// USUARIOS
// ----------------------------------------------------------------------

// ----------------------------------------------------------------//
// USUARIOS - Cambio de contraseña (usando endpoint dedicado)
// ----------------------------------------------------------------//
export const changePassword = async (newPassword) => {
  const data = await request('/api/auth/change-password', {
    method: 'POST',
    body: { password: newPassword }
  });
  return data;
};

// NOTA: La función hashPassword original es un placeholder que no se usa realmente.
// La dejamos como estaba, pero no se invoca en el cambio de contraseña.

export const getUsuarios = async () => {
  const data = await request('/api/usuarios');
  return Array.isArray(data) ? data.map(u => ({
    id: u.documento || u.id || u._id,
    documento: u.documento,
    nombre: u.nombre,
    apellido: u.apellido,
    email: u.email,
    telefono: u.telefono,
    tipoVehiculo: u.tipoVehiculo || u.tipo_vehiculo || '',
    placa: u.placa || '',
    rol: u.rol ? { id: u.rol.id, nombre: u.rol.nombre } : (u.rolId ? { id: u.rolId } : null),
    rol_id: u.rol?.id || u.rolId,
    rol_nombre: u.rol?.nombre,
    proveedor_id: u.proveedor?._id || u.proveedorId,
    proveedor_nombre: u.proveedor?.nombre,
    estado: u.estado,
    fecha_creacion: u.createdAt
  })) : [];
};

export const getUsuarioById = async (id) => {
  const data = await request(`/api/usuarios/${id}`);
  return data;
};

export const createUsuario = async (usuario) => {
  const data = await request('/api/usuarios', { method: 'POST', body: usuario });
  return data;
};

export const updateUsuario = async (id, usuario) => {
  const data = await request(`/api/usuarios/${id}`, { method: 'PUT', body: usuario });
  return data;
};

export const deleteUsuario = async (id) => {
  await request(`/api/usuarios/${id}`, { method: 'DELETE' });
};

export const toggleUsuarioEstado = async (id, nuevoEstado) => {
  return await request(`/api/usuarios/${id}/estado`, { 
    method: 'PATCH',
    body: { estado: nuevoEstado }
  });
};

// ----------------------------------------------------------------------
// ROLES
// ----------------------------------------------------------------------
export const getRoles = async () => {
  const data = await request('/api/roles');
  return Array.isArray(data) ? data.map(r => ({
    id: r._id || r.id,
    nombre: r.nombre,
    descripcion: r.descripcion,
    estado: r.estado,
    permisos: r.permisos || [],
    esDefault: r.esDefault || false
  })) : [];
};

export const getRoleById = async (id) => {
  const data = await request(`/api/roles/${id}`);
  return data;
};

export const createRol = async (rol) => {
  const data = await request('/api/roles', { method: 'POST', body: rol });
  return data;
};

export const updateRol = async (id, rol) => {
  const data = await request(`/api/roles/${id}`, { method: 'PUT', body: rol });
  return data;
};

export const deleteRol = async (id) => {
  await request(`/api/roles/${id}`, { method: 'DELETE' });
};

export const getPermisosDisponibles = async () => {
  // Lista de permisos disponibles en el sistema
  return [
    // Ventas
    'ventas.read', 'ventas.write', 'ventas.delete',
    // Pedidos
    'pedidos.read', 'pedidos.write', 'pedidos.delete',
    // Pagos
    'pagos.read', 'pagos.write', 'pagos.delete',
    // Domicilios
    'domicilios.read', 'domicilios.write', 'domicilios.delete',
    // Productos
    'productos.read', 'productos.write', 'productos.delete',
    // Categorías
    'categorias.read', 'categorias.write', 'categorias.delete',
    // Marcas
    'marcas.read', 'marcas.write', 'marcas.delete',
    // Proveedores
    'proveedores.read', 'proveedores.write', 'proveedores.delete',
    // Usuarios
    'usuarios.read', 'usuarios.write', 'usuarios.delete',
    // Roles
    'roles.read', 'roles.write', 'roles.delete',
    // Configuración
    'config.read', 'config.write',
    // Reportes
    'reportes.read'
  ];
};

// Legacy - getModulos returns permisos disponibles
export const getModulos = async () => {
  return getPermisosDisponibles();
};

export const seedRoles = async () => {
  const data = await request('/api/roles/seed', { method: 'POST' });
  return data;
};

// ----------------------------------------------------------------------
// CATÁLOGO
// ----------------------------------------------------------------------
export const getCatalogo = async () => {
  const data = await request('/api/catalogo');
  return Array.isArray(data) ? data : [];
};

export const getCatalogoByProveedor = async (proveedorId) => {
  const data = await request(`/api/catalogo/proveedor/${proveedorId}`);
  return Array.isArray(data) ? data : [];
};

// ----------------------------------------------------------------------
// DASHBOARD / ESTADÍSTICAS
// ----------------------------------------------------------------------
export const getDashboardStats = async () => {
  const data = await request('/api/dashboard');
  return data;
};

// ----------------------------------------------------------------------
// AUTENTICACIÓN
// ----------------------------------------------------------------------
export const loginUser = async (email, password) => {
  const data = await request('/api/auth/login', { 
    method: 'POST', 
    body: { email, password } 
  });
  return data;
};

export const registerUser = async (userData) => {
  const data = await request('/api/auth/register', { 
    method: 'POST', 
    body: userData 
  });
  return data;
};

export const getCurrentUser = async () => {
  const data = await request('/api/auth/me');
  return data;
};

// ----------------------------------------------------------------------
// CARRITO (Usa endpoints del backend)
// ----------------------------------------------------------------------
export const getCart = async () => {
  const data = await request('/api/carrito');
  return data;
};

export const addToCart = async (productoId, cantidad = 1) => {
  const data = await request('/api/carrito/items', {
    method: 'POST',
    body: { productoId, cantidad }
  });
  return data;
};

export const removeFromCart = async (productoId) => {
  const data = await request(`/api/carrito/items/${productoId}`, {
    method: 'DELETE'
  });
  return data;
};

export const updateCartItem = async (productoId, cantidad) => {
  const data = await request(`/api/carrito/items/${productoId}`, {
    method: 'PUT',
    body: { cantidad }
  });
  return data;
};

export const clearCart = async () => {
  const data = await request('/api/carrito', { method: 'DELETE' });
  return data;
};

// Para compatibilidad hacia atrás - obtener items con detalles
export const getCartItemsWithDetails = async () => {
  const data = await request('/api/carrito');
  if (!data || !data.items) return [];
  return data.items.map(item => ({
    producto: item.producto,
    cantidad: item.cantidad
  }));
};

// ----------------------------------------------------------------------
// ÓRDENES DE COMPRA (Proveedores)
// ----------------------------------------------------------------------
export const getOrdenesCompra = async () => {
  try {
    const data = await request('/api/ordenes-compra');
    return Array.isArray(data) ? data : [];
  } catch (err) {
    // Si el endpoint no existe en el servidor remoto, devolver lista vacía en el frontend
    if (err && (err.status === 404 || String(err.message).includes('Ruta no encontrada'))) return [];
    throw err;
  }
};

export const createOrdenCompra = async (orden) => {
  const data = await request('/api/ordenes-compra', { method: 'POST', body: orden });
  return data;
};

export const updateOrdenCompra = async (id, orden) => {
  const data = await request(`/api/ordenes-compra/${id}`, { method: 'PUT', body: orden });
  return data;
};

export const getOrdenCompraById = async (id) => {
  const data = await request(`/api/ordenes-compra/${id}`);
  return data;
};

export const cambiarEstadoOrdenCompra = async (id, estado) => {
  const data = await request(`/api/ordenes-compra/${id}/estado`, { method: 'PATCH', body: { estado } });
  return data;
};

export const deleteOrdenCompra = async (id) => {
  await request(`/api/ordenes-compra/${id}`, { method: 'DELETE' });
};

export const verificarProductosExistentes = async (productos) => {
  const data = await request('/api/ordenes-compra/verificar-productos', { method: 'POST', body: { productos } });
  return data;
};

export const pedirMasStock = async (productoId, cantidad, proveedorId, precio_unitario, observaciones) => {
  const data = await request('/api/ordenes-compra/pedir-mas-stock', { 
    method: 'POST', 
    body: { productoId, cantidad, proveedorId, precio_unitario, observaciones } 
  });
  return data;
};

// ----------------------------------------------------------------//
// BANNERS (Catálogo)
// ----------------------------------------------------------------//
export const getBanners = async () => {
  const data = await request('/api/banners');
  return Array.isArray(data) ? data : [];
};

export const createBanner = async (banner) => {
  const data = await request('/api/banners', { method: 'POST', body: banner });
  return data;
};

export const deleteBanner = async (id) => {
  await request(`/api/banners/${id}`, { method: 'DELETE' });
};

// ----------------------------------------------------------------//
// TARIFAS DOMICILIO
// ----------------------------------------------------------------//
export const getTarifasDomicilio = async () => {
  const data = await request('/api/tarifas-domicilio');
  return Array.isArray(data) ? data : [];
};

export const createTarifaDomicilio = async (tarifa) => {
  const data = await request('/api/tarifas-domicilio', { method: 'POST', body: tarifa });
  return data;
};

export const updateTarifaDomicilio = async (id, tarifa) => {
  const data = await request(`/api/tarifas-domicilio/${id}`, { method: 'PUT', body: tarifa });
  return data;
};

export const deleteTarifaDomicilio = async (id) => {
  await request(`/api/tarifas-domicilio/${id}`, { method: 'DELETE' });
};

// ----------------------------------------------------------------//
// CARRITO DE PROVEEDOR (LocalStorage)
// ----------------------------------------------------------------//
const STORAGE_KEYS_PROVIDER = {
  PROVIDER_CARTS: 'tienda_provider_carts'
};

const getProviderCartsStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS_PROVIDER.PROVIDER_CARTS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

const saveProviderCartsStorage = (obj) => {
  try {
    localStorage.setItem(STORAGE_KEYS_PROVIDER.PROVIDER_CARTS, JSON.stringify(obj));
  } catch (e) {
    console.error('Error saving provider carts:', e);
  }
};

export const getProviderCart = (proveedorId) => {
  const carts = getProviderCartsStorage();
  return carts[String(proveedorId)] || [];
};

export const saveProviderCart = (proveedorId, cart) => {
  const carts = getProviderCartsStorage();
  carts[String(proveedorId)] = cart;
  saveProviderCartsStorage(carts);
};

export const addToProviderCart = (proveedorId, refId, cantidad = 1, source = 'producto') => {
  const cart = getProviderCart(proveedorId);
  const existing = cart.find(item => item.refId === refId && item.source === source);
  if (existing) {
    existing.cantidad += cantidad;
  } else {
    cart.push({ refId, cantidad, source });
  }
  saveProviderCart(proveedorId, cart);
  return cart;
};

export const removeFromProviderCart = (proveedorId, refId, source = 'producto') => {
  let cart = getProviderCart(proveedorId);
  cart = cart.filter(item => !(item.refId === refId && item.source === source));
  saveProviderCart(proveedorId, cart);
  return cart;
};

export const updateProviderCartItem = (proveedorId, refId, cantidad, source = 'producto') => {
  const cart = getProviderCart(proveedorId);
  const item = cart.find(i => i.refId === refId && i.source === source);
  if (item) {
    item.cantidad = cantidad;
    saveProviderCart(proveedorId, cart);
  }
  return cart;
};

export const clearProviderCart = (proveedorId) => {
  const carts = getProviderCartsStorage();
  delete carts[String(proveedorId)];
  saveProviderCartsStorage(carts);
};

export const getProviderCartItemsWithDetails = async (proveedorId) => {
  const cart = getProviderCart(proveedorId);
  const productos = await getProductos();
  const catalogo = await getCatalogoByProveedor(proveedorId);
  return cart.map(item => {
    if (item.source === 'producto') {
      const producto = productos.find(p => p.id === item.refId) || { id: item.refId, nombre: '(desconocido)', precioUnitario: 0 };
      return { source: 'producto', producto, cantidad: item.cantidad };
    }
    const catalogItem = catalogo.find(c => String(c.id) === String(item.refId)) || { id: item.refId, nombre: '(desconocido)', precioSugerido: 0 };
    return { source: 'catalogo', catalogItem, cantidad: item.cantidad };
  });
};

// ----------------------------------------------------------------//
// DIRECCIONES DEL USUARIO
// ----------------------------------------------------------------//
export const getDirecciones = async () => {
  const data = await request('/api/usuarios/direcciones');
  return Array.isArray(data) ? data : [];
};

export const createDireccion = async (direccion) => {
  const data = await request('/api/usuarios/direcciones', { method: 'POST', body: direccion });
  return data;
};

export const updateDireccion = async (id, direccion) => {
  const data = await request(`/api/usuarios/direcciones/${id}`, { method: 'PUT', body: direccion });
  return data;
};

export const deleteDireccion = async (id) => {
  await request(`/api/usuarios/direcciones/${id}`, { method: 'DELETE' });
};

// ----------------------------------------------------------------//
// CONSTANTES
// ----------------------------------------------------------------//
export const ESTADOS_ORDEN = ['Pendiente', 'Aprobada', 'Enviada', 'Recibida', 'Cancelada', 'Anulada'];
export const ESTADOS_VENTA = ['Pendiente', 'PorValidar', 'Completada', 'Anulada', 'Rechazada', 'Cancelado'];
export const METODOS_PAGO = ['Efectivo', 'Tarjeta', 'Abono', 'PagoTransferencia'];

// Mapeo de estados del frontend al backend
const MAPEO_ESTADOS_BACKEND = {
  'Pendiente': 'pendiente',
  'Aprobada': 'aprobado',
  'En Preparacion': 'en_preparacion',
  'Asignado': 'asignado',
  'En Camino': 'en_camino',
  'Completada': 'entregado',
  'Cancelada': 'cancelado'
};

// Mapeo de estados del backend al frontend
const MAPEO_ESTADOS_FRONTEND = {
  'pendiente': 'Pendiente',
  'aprobado': 'Aprobada',
  'en_preparacion': 'En Preparacion',
  'asignado': 'Asignado',
  'en_camino': 'En Camino',
  'entregado': 'Completada',
  'cancelado': 'Cancelada'
};

// ----------------------------------------------------------------//
// ESTADÍSTICAS (Funciones que trabajan con datos de la API)
// ----------------------------------------------------------------//

export const getVentasDelDia = async () => {
  const ventas = await getVentas();
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);
  return ventas.filter(v => {
    const fecha = new Date(v.fechaVenta);
    return fecha >= hoy && fecha < manana;
  });
};

export const getVentasDeLaSemana = async () => {
  const ventas = await getVentas();
  const hoy = new Date();
  const hace7Dias = new Date();
  hace7Dias.setDate(hoy.getDate() - 7);
  return ventas.filter(v => {
    const fecha = new Date(v.fecha || v.fechaVenta);
    return fecha >= hace7Dias && fecha <= hoy;
  });
};

export const getVentasDelMes = async () => {
  const ventas = await getVentas();
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  return ventas.filter(v => {
    const fecha = new Date(v.fechaVenta);
    return fecha >= inicioMes && fecha <= hoy;
  });
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

// ----------------------------------------------------------------//
// DOMICILIOS - Funciones adicionales
// ----------------------------------------------------------------//
export const saveDomicilio = async (domicilio) => {
  // Si el domicilio corresponde a un pedido sintético (id con prefijo 'pedido-'),
  // crear el Domicilio en el backend usando el campo ventaId como 'pedido'.
  try {
    // Si el id parece ser un id de pedido (prefijo 'pedido-') o falta,
    // o si por error `id` coincide con `ventaId` (backend devuelve ventaId en lugar de domicilio._id),
    // tratar como creación de Domicilio nuevo.
    const idIsPedidoSynthetic = String(domicilio.id || '').startsWith('pedido-');
    const idEqualsVentaId = domicilio.id && domicilio.ventaId && String(domicilio.id) === String(domicilio.ventaId);
    if (idIsPedidoSynthetic || !domicilio.id || idEqualsVentaId) {
      // crear dirección primero para evitar casteo a ObjectId en servidores que requieren id
      const direccionPayload = {
        nombre: domicilio.nombre || 'Dirección temporal',
        direccion: domicilio.direccion || '',
        ciudad: domicilio.ciudad || domicilio.barrio || '',
        barrio: domicilio.barrio || domicilio.ciudad || '',
        telefono: domicilio.telefono || ''
      };
      let direccionCreada = null;
      try {
        direccionCreada = await createDireccion(direccionPayload);
      } catch (err) {
        // ignore and fallback to sending object (server may accept it)
      }

      const payload = {
        pedido: domicilio.ventaId || (domicilio.pedido || domicilio.id),
        direccion: direccionCreada && direccionCreada._id ? String(direccionCreada._id) : (direccionCreada || {
          direccion: domicilio.direccion || '',
          barrio: domicilio.barrio || '',
          telefono: domicilio.telefono || ''
        }),
        tarifa: (domicilio.tarifaAplicada ?? domicilio.tarifa_aplicada ?? domicilio.tarifa) ?? 0,
        repartidor: domicilio.repartidor?.nombre || (domicilio.repartidor || ''),
        telefono_repartidor: domicilio.repartidor?.telefono || domicilio.telefono || ''
      };
      // Si viene info extra de repartidor existente
      if (domicilio.repartidor?.repartidorId) {
        payload.repartidor_extra = {
          repartidorId: domicilio.repartidor.repartidorId,
          tipoVehiculo: domicilio.repartidor.tipoVehiculo,
          placa: domicilio.repartidor.placa
        };
      }

      return await request('/api/domicilios', { method: 'POST', body: payload });
    }

    // Si ya existe un domicilio real en DB, actualizar tarifa u otros campos
    if (domicilio.id) {
      // Actualizaciones puntuales soportadas por la API:
      // - tarifa -> PATCH /:id/tarifa { tarifa }
      // - repartidor -> usar `asignarRepartidor(ventaId, ...)` o PATCH /:id/repartidor
      // - estado -> PATCH /:id/estado (usado por updateDomicilioEstado)
      // Para campos no soportados por rutas explícitas (ej. observaciones), la API debe ser extendida.

      if (domicilio.tarifa !== undefined) {
        // Intentar actualizar tarifa usando endpoint concreto; si 404, lanzar error informativo
        try {
          return await request(`/api/domicilios/${domicilio.id}/tarifa`, { method: 'PATCH', body: { tarifa: domicilio.tarifa } });
        } catch (err) {
          if (err && err.status === 404) {
            throw new Error('El endpoint /api/domicilios/:id/tarifa no existe en el API. Actualiza el backend para soportar actualización de tarifa.');
          }
          throw err;
        }
      }

      if (domicilio.repartidor) {
        // Si se pasó objeto repartidor completo, usar asignarRepartidor (que gestiona creación/patch)
        try {
          return await asignarRepartidor(domicilio.ventaId || domicilio.pedido || domicilio.id, domicilio.repartidor);
        } catch (err) {
          throw err;
        }
      }

      // Si sólo se quieren guardar observaciones/notas pero no existe ruta, informar al usuario
      if (domicilio.notas !== undefined) {
        throw new Error('El API no proporciona una ruta para actualizar notas/observaciones del domicilio. Añade un endpoint en el backend o usa la acción administrativa correspondiente.');
      }

      // Nada que actualizar con rutas conocidas
      return null;
    }
  } catch (err) {
    throw err;
  }
  return null;
};

export const asignarRepartidor = async (ventaId, repartidorData) => {
  const dom = await getDomicilioByVentaId(ventaId);
  
  // Normalizar: puede venir {repartidor: {...}, ...} o {nombre, telefono, ...}
  const repObj = repartidorData.repartidor || repartidorData;
  const repId = repartidorData.repartidorId;
  const repTarifa = repartidorData.tarifa;
  
  if (dom) {
    if (String(dom.id || '').startsWith('pedido-')) {
      const direccionPayload = {
        nombre: repObj.nombre || 'Dirección temporal',
        direccion: dom.direccion || '',
        ciudad: dom.ciudad || dom.barrio || '',
        barrio: dom.barrio || dom.ciudad || '',
        telefono: dom.telefono || ''
      };
      let direccionCreada = null;
      try {
        direccionCreada = await createDireccion(direccionPayload);
      } catch (err) {
        const payloadFallback = {
          pedido: ventaId,
          direccion: {
            direccion: dom.direccion || '',
            barrio: dom.barrio || dom.ciudad || '',
            telefono: dom.telefono || ''
          },
          tarifa: repTarifa !== undefined && repTarifa !== null ? parseFloat(repTarifa) : null,
          repartidor: {
            nombre: repObj.nombre || '',
            telefono: repObj.telefono || '',
            tipoVehiculo: repObj.tipoVehiculo || '',
            placa: repObj.placa || ''
          }
        };
        if (repId) payloadFallback.repartidorId = repId;
        return await request('/api/domicilios', { method: 'POST', body: payloadFallback });
      }

      const payload = {
        pedido: ventaId,
        direccion: direccionCreada && direccionCreada._id ? String(direccionCreada._id) : direccionCreada,
        repartidor: {
          nombre: repObj.nombre || '',
          telefono: repObj.telefono || '',
          tipoVehiculo: repObj.tipoVehiculo || '',
          placa: repObj.placa || ''
        }
      };
      
      // Incluir la tarifa directamente en el payload si es un número
      if (repTarifa !== undefined && repTarifa !== null && !isNaN(parseFloat(repTarifa))) {
        payload.tarifa = parseFloat(repTarifa);
      }
      if (repId) {
        payload.repartidorId = repId;
      }

      const created = await request('/api/domicilios', { method: 'POST', body: payload });

      // Intentar obtener el ID del domicilio creado
      let domicilioId = null;
      if (created && (created._id || created.id)) {
        domicilioId = String(created._id || created.id);
      }
      
      // Si la tarifa no se incluyó en el payload o falló, intentar actualizar
      if (repTarifa !== undefined && repTarifa !== null && domicilioId) {
        try {
          await request(`/api/domicilios/${domicilioId}/tarifa`, { method: 'PATCH', body: { tarifa: parseFloat(repTarifa) } });
        } catch (e) {}
      }
      return created;
    }

    try {
      const updated = await request(`/api/domicilios/${dom.id}/repartidor`, { 
        method: 'PATCH', 
        body: {
          repartidor: {
            nombre: repObj.nombre,
            telefono: repObj.telefono,
            tipoVehiculo: repObj.tipoVehiculo || '',
            placa: repObj.placa || ''
          },
          repartidorId: repId,
          tarifa: repTarifa
        }
      });
      return updated;
    } catch (err) {
      if (err && (err.status === 404 || String(err.message).toLowerCase().includes('ruta no encontrada') || String(err.message).includes('/repartidor'))) {
        const body = {
          repartidor: {
            nombre: repObj.nombre || '',
            telefono: repObj.telefono || '',
            tipoVehiculo: repObj.tipoVehiculo || '',
            placa: repObj.placa || ''
          },
          observaciones: repartidorData.notas || undefined
        };
        if (repId) body.repartidorId = repId;
        const updated2 = await request(`/api/domicilios/${dom.id}`, { method: 'PUT', body });
        if (repTarifa !== undefined && repTarifa !== null) {
          try {
            await editarTarifaDomicilio(dom.id, repTarifa);
          } catch (e) {}
        }
        return updated2;
      }
      throw err;
    }
  }
  return null;
};
export const editarRepartidor = async (ventaId, repartidor) => {
  return await asignarRepartidor(ventaId, repartidor);
};

export const editarTarifaDomicilio = async (ventaId, tarifa) => {
  const dom = await getDomicilioByVentaId(ventaId);
  if (dom) {
    return await request(`/api/domicilios/${dom.id}/tarifa`, { 
      method: 'PATCH', 
      body: { tarifa } 
    });
  }
  return null;
};

// ----------------------------------------------------------------//
// PAGOS - Funciones adicionales
// ----------------------------------------------------------------//
export const getTotalPagadoByVenta = async (ventaId) => {
  const pagos = await getPagos();
  const pagosVenta = pagos.filter(p => String(p.ventaId) === String(ventaId));
  let total = 0;
  pagosVenta.forEach(p => {
    const estado = String(p.estado).toLowerCase();
    // Contar tanto aplicados como pendientes
    if (estado === 'aplicado' || estado === 'pendiente') {
      if (p.movimientos && p.movimientos.length) {
        total += p.movimientos.reduce((s, m) => s + (parseFloat(m.monto) || 0), 0);
      } else {
        total += parseFloat(p.monto) || 0;
      }
    }
  });
  return total;
};

export const getPagosByVenta = async (ventaId) => {
  const pagos = await getPagos();
  return pagos.filter(p => String(p.ventaId) === String(ventaId)).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
};

export const aprobarSolicitudAbono = async (pedidoId) => {
  return await request(`/api/pedidos/${pedidoId}/aprobar`, { method: 'PATCH' });
};

export const rechazarAbono = async (pedidoId, motivo) => {
  return await request(`/api/pedidos/${pedidoId}/rechazar-abono`, { 
    method: 'PATCH', 
    body: { motivo } 
  });
};

export const aprobarPedido = async (pedidoId) => {
  return await request(`/api/pedidos/${pedidoId}/aprobar`, { method: 'PATCH' });
};

// ----------------------------------------------------------------//
// FLUJO DE ABONOS
// ----------------------------------------------------------------//
export const autorizarAbono = async (ventaId) => {
  return await updateVenta(ventaId, { estado: 'Aprobado' });
};

export const registrarAbono = async (ventaId, monto, metodo = 'Abono') => {
  // Crear pago y actualizar estado si total pagado >= total
  // Crear en estado pendiente para que admin lo apruebe
  const pago = await createPago({ ventaId, monto, metodo, estado: 'pendiente' });
  const totalPagado = await getTotalPagadoByVenta(ventaId);
  const venta = await getVentaById(ventaId);
  if (totalPagado >= venta.total) {
    await updateVenta(ventaId, { estado: 'Completada' });
  }
  return pago;
};

// ----------------------------------------------------------------//
// MARCAS - Funciones adicionales para proveedores
// ----------------------------------------------------------------//
export const getMarcasByProveedor = async (proveedorId) => {
  const marcas = await getMarcas();
  return marcas.filter(m => String(m.proveedorId) === String(proveedorId));
};

export const createMarcaAndLinkProveedor = async (marca, proveedorId) => {
  const nuevaMarca = await createMarca(marca);
  if (proveedorId && nuevaMarca.id) {
    await request(`/api/marcas/${nuevaMarca.id}/proveedor`, {
      method: 'PATCH',
      body: { proveedor: proveedorId }
    });
  }
  return nuevaMarca;
};

export const assignProveedorToMarca = async (marcaId, proveedorId) => {
  return await request(`/api/marcas/${marcaId}/proveedor`, {
    method: 'PATCH',
    body: { proveedor: proveedorId }
  });
};

// ----------------------------------------------------------------//
// DOMICILIOS - Import/Export
// ----------------------------------------------------------------//
export const importDomicilios = async (file, onSuccess, onError) => {
  try {
    const data = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(data, { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    for (const row of rows) {
      const direccion = row.Direccion || row.direccion || '';
      const ciudad = row.Ciudad || row.ciudad || '';
      const telefono = row.Telefono || row.telefono || '';
      if (direccion && ciudad) {
        await createDireccion({ direccion, ciudad, telefono });
      }
    }
    onSuccess && onSuccess(rows.length);
  } catch (err) {
    onError && onError(err);
  }
};

export const exportDomicilios = async () => {
  const domicilios = await getDomicilios();
  const data = domicilios.map(d => ({
    Id: d.id,
    Direccion: d.direccion,
    Ciudad: d.ciudad,
    Telefono: d.telefono,
    Estado: d.estado,
  }));
  exportToExcel(data, 'domicilios.xlsx');
};

// ----------------------------------------------------------------//
// PAGOS - Import/Export/Anular
// ----------------------------------------------------------------//
export const exportPagos = async () => {
  const pagos = await getPagos();
  const data = pagos.map(p => ({
    Id: p.id,
    VentaId: p.ventaId,
    Monto: p.monto,
    Metodo: p.metodo,
    Estado: p.estado,
    Fecha: p.fecha,
  }));
  exportToExcel(data, 'pagos.xlsx');
};

export const importPagos = async (file, onSuccess, onError) => {
  try {
    const data = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(data, { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    for (const row of rows) {
      const ventaId = row.VentaId || row.ventaId || '';
      const monto = parseFloat(row.Monto || row.monto || 0);
      const metodo = row.Metodo || row.metodo || 'Efectivo';
      if (ventaId && monto) {
        await createPago({ ventaId, monto, metodo, estado: 'completado' });
      }
    }
    onSuccess && onSuccess(rows.length);
  } catch (err) {
    onError && onError(err);
  }
};

export const anularPago = async (id) => {
  return await request(`/api/pagos/${id}`, { method: 'DELETE' });
};

// ----------------------------------------------------------------//
// ROLES - Módulos
// ----------------------------------------------------------------//
export const getRoleModules = async (rolId) => {
  // Si no hay módulos en el API, devolvemos vacío
  return [];
};

export const assignRoleModules = async (rolId, modulos) => {
  // No implementado en el API; solo placeholder
  return { success: true };
};

// ----------------------------------------------------------------//
// VENTAS - Import/Export
// ----------------------------------------------------------------//
export const exportVentas = async () => {
  const ventas = await getVentas();
  const data = ventas.map(v => ({
    Id: v.id,
    Fecha: v.fechaVenta,
    Usuario: v.usuarioNombre,
    Total: v.total,
    Estado: v.estado,
    Tipo: v.delivery ? 'Domicilio' : 'Mostrador',
  }));
  exportToExcel(data, 'ventas.xlsx');
};

export const importVentas = async (file, onSuccess, onError) => {
  // Las ventas no se importan directamente de Excel
  onError && onError(new Error('Importación de ventas no soportada.'));
};

// ----------------------------------------------------------------//
// USUARIOS - Import/Export
// ----------------------------------------------------------------//
export const exportUsuarios = async () => {
  const usuarios = await getUsuarios();
  const data = usuarios.map(u => ({
    Id: u.id,
    Nombre: u.nombre,
    Apellido: u.apellido,
    Email: u.email,
    Telefono: u.telefono,
    Documento: u.documento,
    Estado: u.estado,
  }));
  exportToExcel(data, 'usuarios.xlsx');
};

export const importUsuarios = async (file, onSuccess, onError) => {
  try {
    const data = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(data, { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    for (const row of rows) {
      const nombre = row.Nombre || row.nombre || '';
      const email = row.Email || row.email || '';
      const password = row.Password || row.password || 'password123';
      if (nombre && email) {
        await createUsuario({ nombre, email, password });
      }
    }
    onSuccess && onSuccess(rows.length);
  } catch (err) {
    onError && onError(err);
  }
};

// ----------------------------------------------------------------//
// HOME - Banner
// ----------------------------------------------------------------//
export const getBanner = async () => {
  const data = await request('/api/banners');
  return data && data.length > 0 ? data[0] : { imagen: '', activo: true };
};

export const updateBanner = async (bannerData) => {
  const existentes = await request('/api/banners');
  if (existentes && existentes.length > 0) {
    return await request(`/api/banners/${existentes[0]._id}`, {
      method: 'PUT',
      body: bannerData
    });
  }
  // Si no existe, crear uno nuevo
  return await request('/api/banners', { method: 'POST', body: bannerData });
};

// ----------------------------------------------------------------//
// DIRECCIONES - Cliente


// ----------------------------------------------------------------//
// VENTAS - Estados y acciones
// ----------------------------------------------------------------//
export const aceptarVenta = async (id) => {
  return await cambiarEstadoVenta(id, 'confirmado');
};

export const aprobarVenta = async (id) => {
  return await cambiarEstadoVenta(id, 'entregado');
};

// ----------------------------------------------------------------//
// ÓRDENES DE COMPRA - Funciones adicionales
// ----------------------------------------------------------------//

export const generarReporteOrdenes = async () => {
  const ordenes = await getOrdenCompra();
  const data = ordenes.map(o => ({
    Id: o.id,
    Fecha: o.fecha,
    Proveedor: o.proveedorId,
    Total: o.total,
    Estado: o.estado,
  }));
  exportToExcel(data, 'ordenes_compra.xlsx');
};

// ----------------------------------------------------------------//
// CATÁLOGO - Export para proveedor
// ----------------------------------------------------------------//
export const exportCatalogoProveedor = async (proveedorId) => {
  const catalogo = await getCatalogoByProveedor(proveedorId);
  const data = catalogo.map(c => ({
    RefId: c.refId,
    Nombre: c.nombre,
    Precio: c.precioSugerido,
    Stock: c.stock,
  }));
  exportToExcel(data, 'catalogo.xlsx');
};

export const importCatalogoProveedor = async (proveedorId, file, onSuccess, onError) => {
  try {
    const data = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(data, { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    for (const row of rows) {
      const refId = row.RefId || row.refId || '';
      const nombre = row.Nombre || row.nombre || '';
      const precioSugerido = parseFloat(row.Precio || row.precioSugerido || 0);
      const stock = parseInt(row.Stock || row.stock || 0, 10);
      if (refId && nombre) {
        await createCatalogo({
          proveedor: proveedorId,
          refId,
          nombre,
          precioSugerido,
          stock,
        });
      }
    }
    onSuccess && onSuccess(rows.length);
  } catch (err) {
    onError && onError(err);
  }
};

export const createCatalogoItem = async (item) => {
  return await request('/api/catalogo', { method: 'POST', body: item });
};

export const getCatalogoItemById = async (id) => {
  return await request(`/api/catalogo/${id}`);
};

export const updateCatalogoItem = async (id, item) => {
  return await request(`/api/catalogo/${id}`, { method: 'PUT', body: item });
};

export const deleteCatalogoItem = async (id) => {
  return await request(`/api/catalogo/${id}`, { method: 'DELETE' });
};

// ----------------------------------------------------------------//
// UTILIDADES
// ----------------------------------------------------------------//
export const hashPassword = async (password) => {
  return password;
};

// ----------------------------------------------------------------//
// USUARIOS - Por email
// ----------------------------------------------------------------//
export const getUsuarioByEmail = async (email) => {
  return await request(`/api/usuarios/email/${email}`);
};

// ----------------------------------------------------------------//
// PAGOS - Total recibido
// ----------------------------------------------------------------//
export const getTotalRecibidoByVenta = async (ventaId) => {
  return await getTotalPagadoByVenta(ventaId);
};