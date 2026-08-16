// src/pages/domicilios/hooks/domicilioEstados.js
const TRANSICIONES_DOMICILIO = {
  pendiente: ['aprobado', 'cancelado'],
  aprobado: ['asignado', 'cancelado'],
  asignado: ['en_camino', 'cancelado'],
  en_camino: ['entregado'],
  entregado: [],
  cancelado: [],
};
const ESTADOS_DOMICILIO_FINALES = ['entregado', 'cancelado'];

export const getSiguientesEstadosDomicilio = (estadoActual) => TRANSICIONES_DOMICILIO[String(estadoActual || '').toLowerCase()] || [];
export const isEstadoFinalDomicilio = (estado) => ESTADOS_DOMICILIO_FINALES.includes(String(estado || '').toLowerCase());

export const normalizeNumber = (num, defaultCountry = '57') => {
  if (!num) return '';
  let s = String(num).replace(/\D/g, '');
  s = s.replace(/^0+/, '');
  if (s.length <= 10) s = `${defaultCountry}${s}`;
  return s;
};
