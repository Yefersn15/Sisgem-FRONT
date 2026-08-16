// src/pages/ventas/hooks/ventaFormatters.js
export const formatFecha = (fecha) => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const METODO_BADGES = {
  Efectivo: 'bg-success',
  Transferencia: 'bg-info',
  Abono: 'bg-warning',
};

export const getMetodoBadge = (metodo) => METODO_BADGES[metodo] || 'bg-secondary';
