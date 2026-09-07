import { Link } from 'react-router-dom';

const MarcaRow = ({ marca, onToggleActiva, onDelete, onView }) => (
  <tr>
    <td className="fw-medium">{marca.nombre}</td>
    <td><small>{marca.descripcion || '-'}</small></td>
    <td>
      <span className="badge bg-secondary">{marca.productoCount}</span>
    </td>
    <td>
      <button
        className={`btn btn-sm ${marca.activa ? 'btn-outline-warning' : 'btn-outline-success'}`}
        onClick={() => onToggleActiva(marca)}
        title={marca.activa ? 'Desactivar' : 'Activar'}
      >
        <i className={`fas fa-toggle-${marca.activa ? 'off' : 'on'}`}></i>
      </button>
    </td>
    <td>
      <div className="d-flex gap-1">
        <button
          className="btn btn-outline-info btn-sm"
          onClick={() => onView(marca.id)}
          title="Ver detalles"
        >
          <i className="fas fa-eye"></i>
        </button>
        <Link to={`/marcas/editar/${marca.id}`} className="btn btn-outline-primary btn-sm" title="Editar">
          <i className="fas fa-edit"></i>
        </Link>
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => onDelete(marca.id)}
          title="Eliminar"
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </td>
  </tr>
);

export default MarcaRow;
