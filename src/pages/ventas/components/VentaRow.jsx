import { Link } from 'react-router-dom';
import { formatPrice } from '../../../services/api/utils';
import { formatFecha, getMetodoBadge } from '../hooks/ventaFormatters';

const ESTADO_BADGES = {
  pendiente: 'bg-warning',
  por_validar: 'bg-info',
  completada: 'bg-success',
  anulada: 'bg-danger',
  rechazada: 'bg-danger',
  cancelado: 'bg-secondary',
};
const getEstadoBadge = (estado) => ESTADO_BADGES[estado] || 'bg-secondary';

const VentaRow = ({ venta, onEdit, onAprobar, onAnular }) => (
  <tr>
    <td>{formatFecha(venta.fecha)}</td>
    <td>{venta.usuarioNombre || 'Usuario no registrado'}</td>
    <td className="text-end">{formatPrice(venta.subtotal)}</td>
    <td className="text-end">{formatPrice(venta.shipping)}</td>
    <td className="text-end fw-medium">{formatPrice(venta.total)}</td>
    <td>
      <span className={`badge ${getEstadoBadge(venta.estadoVenta)}`}>
        {venta.estadoVenta}
      </span>
    </td>
    <td>
      <span className={`badge ${getMetodoBadge(venta.metodoPago)}`}>
        {venta.metodoPago}
      </span>
    </td>
    <td>
      <div className="d-flex gap-1">
        <Link to={`/ventas/${venta.id}`} className="btn btn-sm btn-outline-info" title="Ver detalle">
          <i className="fas fa-eye"></i>
        </Link>
        <button className="btn btn-sm btn-outline-primary" title="Editar" onClick={() => onEdit(venta)}>
          <i className="fas fa-edit"></i>
        </button>
        {venta.estadoVenta !== 'anulada' && venta.estadoVenta !== 'completada' && (
          <button className="btn btn-sm btn-outline-success" title="Aprobar" onClick={() => onAprobar(venta.id)}>
            <i className="fas fa-check"></i>
          </button>
        )}
        {venta.estadoVenta !== 'anulada' && (
          <button className="btn btn-sm btn-outline-danger" title="Anular" onClick={() => onAnular(venta.id)}>
            <i className="fas fa-ban"></i>
          </button>
        )}
      </div>
    </td>
  </tr>
);

export default VentaRow;
