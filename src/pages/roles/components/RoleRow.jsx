import React from 'react';
import { Link } from 'react-router-dom';
import PermisosViewer from './PermisosViewer';

const RoleRow = ({ rol, showPermisos, onTogglePermisos, onDelete, getPermisosAsignados, categoriasPermisos }) => (
  <React.Fragment>
    <tr>
      <td className="fw-bold">{rol.nombre}</td>
      <td>{rol.descripcion || '—'}</td>
      <td>
        <span className="badge bg-secondary">{getPermisosAsignados(rol).length} permisos</span>
      </td>
      <td>
        {rol.esDefault ? (
          <span className="badge bg-primary">Por defecto</span>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
      <td>
        <span className={`badge ${rol.estado ? 'bg-success' : 'bg-secondary'}`}>
          {rol.estado ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td>
        <div className="d-flex gap-1">
          <button
            className={`btn btn-sm ${showPermisos ? 'btn-primary' : 'btn-outline-info'}`}
            onClick={() => onTogglePermisos(rol.id)}
            title="Ver permisos"
          >
            <i className="fas fa-key"></i>
          </button>
          <Link to={`/admin/roles/editar/${rol.id}`} className="btn btn-sm btn-outline-primary">
            <i className="fas fa-edit"></i>
          </Link>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDelete(rol.id, rol.nombre)}
            title="Eliminar"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
    {showPermisos && (
      <tr>
        <td colSpan="6" className="bg-light">
          <PermisosViewer rol={rol} categoriasPermisos={categoriasPermisos} />
        </td>
      </tr>
    )}
  </React.Fragment>
);

export default RoleRow;
