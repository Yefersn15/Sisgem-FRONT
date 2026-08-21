// src/pages/ventas/services/ventasService.js
export {
  getVentas,
  getVentaById,
  createVenta,
  updateVenta,
  deleteVenta,
  cambiarEstado,
  aprobarSolicitudAbono,
  rechazarAbono,
} from '../../../services/api/pedidos.api';
export { cambiarEstadoPago, getPagosByVenta, getTotalPagadoByVenta } from '../../../services/api/pagos.api';
export { getDomicilioByVentaId } from '../../../services/api/domicilios.api';
