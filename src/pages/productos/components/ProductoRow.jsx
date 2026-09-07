import { formatPrice } from '../../../services/api/utils';

const ProductoRow = ({ producto, onToggleActivo, onDelete, onView, onEdit }) => (
  <tr>
    <td className="fw-medium">{producto.nombre}</td>
    <td>{producto.marcaNombre}</td>
    <td>{producto.categoriaNombre}</td>
    <td>{formatPrice(producto.precioUnitario)}</td>
    <td>
      <span className={`badge ${(parseInt(producto.stockDisponible) || 0) > 0 ? 'bg-success' : 'bg-danger'}`}>
        {producto.stockDisponible || 0}
      </span>
    </td>
    <td>
      <button
        className={`btn btn-sm ${producto.activo !== false ? 'btn-outline-warning' : 'btn-outline-success'}`}
        onClick={() => onToggleActivo(producto)}
        title={producto.activo !== false ? 'Desactivar' : 'Activar'}
      >
        <i className={`fas fa-toggle-${producto.activo !== false ? 'off' : 'on'}`}></i>
      </button>
    </td>
    <td>
      <div className="d-flex gap-1">
        <button
          className="btn btn-outline-info btn-sm"
          onClick={() => onView(producto.id)}
          title="Ver detalle"
        >
          <i className="fas fa-eye"></i>
        </button>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => onEdit(producto.id)}
          title="Editar"
        >
          <i className="fas fa-edit"></i>
        </button>
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => onDelete(producto.id)}
          title="Eliminar"
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </td>
  </tr>
);

export default ProductoRow;
