import { Link } from 'react-router-dom';

const CategoriaRow = ({ categoria, onToggleActiva, onDelete }) => (
  <tr>
    <td className="fw-medium">{categoria.nombre}</td>
    <td><small>{categoria.descripcion || '-'}</small></td>
    <td>
      <span className="badge bg-secondary">{categoria.productoCount}</span>
    </td>
    <td>
      <button
        className={`btn btn-sm ${categoria.activa ? 'btn-outline-warning' : 'btn-outline-success'}`}
        onClick={() => onToggleActiva(categoria)}
        title={categoria.activa ? 'Desactivar' : 'Activar'}
      >
        <i className={`fas fa-toggle-${categoria.activa ? 'off' : 'on'}`}></i>
      </button>
    </td>
    <td>
      <div className="d-flex gap-1">
        <Link to={`/categorias/editar/${categoria.id}`} className="btn btn-outline-primary btn-sm" title="Editar">
          <i className="fas fa-edit"></i>
        </Link>
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => onDelete(categoria.id)}
          title="Eliminar"
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </td>
  </tr>
);

export default CategoriaRow;
