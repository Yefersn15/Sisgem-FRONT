import { Link } from 'react-router-dom';
import { formatPrice } from '../../../services/api/utils';

const PagoRow = ({ venta, onAbonar }) => (
  <tr>
    <td>#{venta.id}</td>
    <td>{venta.usuarioNombre || 'Usuario no registrado'}</td>
    <td>{venta.fecha ? new Date(venta.fecha).toLocaleString() : 'N/A'}</td>
    <td className="fw-bold">{formatPrice(venta.saldoPendiente)}</td>
    <td>{venta.metodoPago}</td>
    <td>
      <span className={`badge ${venta.estadoPago === 'Pagado' ? 'bg-success' : 'bg-warning text-dark'}`}>
        {venta.estadoPago}
      </span>
    </td>
    <td>
      {venta.tipo_venta === 'domicilio' ? (
        <span className="badge bg-info">Domicilio</span>
      ) : (
        <span className="text-muted">Tienda</span>
      )}
    </td>
    <td>
      <div className="d-flex gap-1">
        <Link to={`/admin/pagos/${venta.id}`} className="btn btn-sm btn-outline-info" title="Ver detalle">
          <i className="fas fa-eye"></i>
        </Link>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => onAbonar(venta)}
          title="Abonar"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>
    </td>
  </tr>
);

export default PagoRow;
