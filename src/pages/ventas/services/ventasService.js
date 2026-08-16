// src/pages/ventas/services/ventasService.js
export {
  getVentas,
  getVentaById,
  createVenta,
  updateVenta,
  deleteVenta,
  cambiarEstado,
  cambiarEstadoPago,
  aprobarSolicitudAbono,
  rechazarAbono,
  getPagosByVenta,
  getTotalPagadoByVenta,
  getDomicilioByVentaId,
} from '../../../services/dataService';
