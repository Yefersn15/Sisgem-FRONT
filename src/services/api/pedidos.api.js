// src/services/api/pedidos.api.js
// Pedidos y ventas viven juntos porque son la misma entidad en el backend
// (un pedido se "convierte" en venta): no existe un módulo /api/ventas separado.
import { request } from './client';
import { exportToExcel } from './utils';
import { createPago, getTotalPagadoByVenta } from './pagos.api';

export const mapPedidoToFront = (pedido) => {
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
      } : (item.productoSnapshot ? {
        nombre: item.productoSnapshot.nombre || item.productoSnapshot,
        fotoUrl: item.productoSnapshot.fotoUrl,
        codigoBarras: item.productoSnapshot.codigoBarras
      } : null)
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

// ----------------------------------------------------------------------
// CONSTANTES
// ----------------------------------------------------------------------
export const ESTADOS_VENTA = ['Pendiente', 'PorValidar', 'Completada', 'Anulada', 'Rechazada', 'Cancelado'];
export const METODOS_PAGO = ['Efectivo', 'Tarjeta', 'Abono', 'PagoTransferencia'];

// ----------------------------------------------------------------------
// FLUJO DE ABONOS
// ----------------------------------------------------------------------
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

// ----------------------------------------------------------------------
// VENTAS - Import/Export
// ----------------------------------------------------------------------
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

// ----------------------------------------------------------------------
// VENTAS - Estados y acciones
// ----------------------------------------------------------------------
// NOTA: preservadas tal cual del archivo original. `cambiarEstadoVenta` no
// existe en este módulo (tampoco existía en dataService.js): ambas funciones
// ya estaban rotas antes del split y no se usan en ninguna pantalla actual.
export const aceptarVenta = async (id) => {
  return await cambiarEstadoVenta(id, 'confirmado');
};

export const aprobarVenta = async (id) => {
  return await cambiarEstadoVenta(id, 'entregado');
};

// ----------------------------------------------------------------------
// ESTADÍSTICAS - ventas por periodo
// ----------------------------------------------------------------------
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
