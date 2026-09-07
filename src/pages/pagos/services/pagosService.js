// src/pages/pagos/services/pagosService.js
export {
  getPagos,
  getMisPagos,
  getPagoById,
  createPago,
  updatePago,
  deletePago,
  cambiarEstadoPago,
  anularPago,
  exportPagos,
  importPagos,
  getPagosByVenta,
  getTotalPagadoByVenta,
  getTotalRecibidoByVenta,
} from '../../../services/api/pagos.api';
export { getVentaById } from '../../../services/api/pedidos.api';
export { getDomicilioByVentaId } from '../../../services/api/domicilios.api';
