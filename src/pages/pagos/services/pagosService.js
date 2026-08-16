// src/pages/pagos/services/pagosService.js
export {
  getPagos,
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
  getVentaById,
  getDomicilioByVentaId,
} from '../../../services/dataService';
