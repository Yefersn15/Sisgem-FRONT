// src/services/api/caja.api.js
import { request } from './client';

export const abrirCaja = (montoInicial, notas) =>
  request('/api/caja/abrir', { method: 'POST', body: { montoInicial, notas } });

// Devuelve { sesion, resumen } o null si no hay ninguna caja abierta.
export const getCajaActual = async () => {
  try {
    return await request('/api/caja/actual');
  } catch (e) {
    console.error('Error obteniendo la caja actual:', e);
    return null;
  }
};

export const cerrarCaja = (id, montoContado, notas) =>
  request(`/api/caja/${id}/cerrar`, { method: 'PATCH', body: { montoContado, notas } });

export const getHistorialCaja = async () => {
  try {
    const data = await request('/api/caja');
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Error obteniendo historial de caja:', e);
    return [];
  }
};

export const getCajaPorId = (id) => request(`/api/caja/${id}`);
