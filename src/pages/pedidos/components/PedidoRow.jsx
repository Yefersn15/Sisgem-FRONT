import { formatPrice } from '../../../services/api/utils';

const PedidoRow = ({ pedido, onAprobarAbono, onRechazarAbono, onVerDetalle }) => (
  <tr>
    <td>{pedido.tipo_venta === 'domicilio' ? 'Domicilio' : 'Mostrador'}</td>
    <td>{new Date(pedido.fecha).toLocaleString()}</td>
    <td>{pedido.usuarioNombre || 'Usuario'}</td>
    <td className="text-end fw-medium">{formatPrice(pedido.total)}</td>
    <td>
      {pedido.metodoPago === 'Abono' && pedido.estadoPedido === 'pendiente' ? (
        <div className="d-flex gap-1">
          <button className="btn btn-sm btn-outline-success" onClick={() => onAprobarAbono(pedido.id, pedido.metodoPago)} title="Aprobar abono">
            <i className="fas fa-check"></i>
          </button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => onRechazarAbono(pedido.id)} title="Rechazar abono">
            <i className="fas fa-times"></i>
          </button>
        </div>
      ) : (
        <span className={`badge ${
          pedido.estadoPedido === 'entregado' ? 'bg-success' :
          pedido.estadoPedido === 'cancelado' ? 'bg-danger' :
          pedido.estadoPedido === 'en_camino' ? 'bg-info' :
          pedido.estadoPedido === 'asignado' || pedido.estadoPedido === 'en_preparacion' ? 'bg-warning' :
          pedido.estadoPedido === 'aprobado' ? 'bg-primary' : 'bg-secondary'
        }`}>
          {pedido.estadoPedido === 'en_preparacion' ? 'En preparación' :
           pedido.estadoPedido === 'en_camino' ? 'En camino' :
           String(pedido.estadoPedido).charAt(0).toUpperCase() + String(pedido.estadoPedido).slice(1)}
        </span>
      )}
    </td>
    <td>{pedido.metodoPago}</td>
    <td>
      <div className="d-flex gap-1">
        {pedido.estadoPedido === 'Pendiente' && (
          <>
            <button className="btn btn-sm btn-outline-success" onClick={() => onAprobarAbono(pedido.id, pedido.metodoPago)} title="Aprobar">
              <i className="fas fa-check"></i>
            </button>
            {pedido.metodoPago === 'Abono' && (
              <button className="btn btn-sm btn-outline-danger" onClick={() => onRechazarAbono(pedido.id)} title="Rechazar">
                <i className="fas fa-times"></i>
              </button>
            )}
          </>
        )}
        <button className="btn btn-sm btn-outline-primary" onClick={() => onVerDetalle(pedido.id)} title="Ver detalle">
          <i className="fas fa-eye"></i>
        </button>
      </div>
    </td>
  </tr>
);

export default PedidoRow;
