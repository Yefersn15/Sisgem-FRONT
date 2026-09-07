// src/services/api/pagos.api.js
import * as XLSX from 'xlsx';
import { request } from './client';
import { exportToExcel } from './utils';

const mapearPago = (pago) => {
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
};

export const getPagos = async () => {
  try {
    const data = await request('/api/pagos');
    return Array.isArray(data) ? data.map(mapearPago) : [];
  } catch (e) {
    console.error('Error obteniendo pagos:', e);
    return [];
  }
};

// A diferencia de getPagos() (GET /api/pagos, solo ADMIN), este es el
// endpoint que sí puede llamar cualquier cliente autenticado: el backend lo
// filtra por su propio documento (ver pagos.service.misPagos), así que no
// hace falta (ni se puede) filtrar por usuario del lado del cliente.
export const getMisPagos = async () => {
  try {
    const data = await request('/api/pagos/mis-pagos');
    return Array.isArray(data) ? data.map(mapearPago) : [];
  } catch (e) {
    console.error('Error obteniendo mis pagos:', e);
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

export const anularPago = async (id) => {
  return await request(`/api/pagos/${id}`, { method: 'DELETE' });
};

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

// ----------------------------------------------------------------------
// PAGOS - agregados por venta
// ----------------------------------------------------------------------
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

export const getTotalRecibidoByVenta = async (ventaId) => {
  return await getTotalPagadoByVenta(ventaId);
};
