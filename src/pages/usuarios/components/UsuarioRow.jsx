import { Link } from 'react-router-dom';

const UsuarioRow = ({ usuario, source, currentUser, isAdmin, getRoleName, onVerDetalle, onCambiarRol, onToggleEstado }) => {
  const esUsuarioActual = currentUser && currentUser.documento === usuario.documento;
  const esAdminPrincipal = usuario.esAdminPrincipal;
  const tituloProtegido = 'Cuenta del administrador principal (definida en .env) — se gestiona con "npm run seed:db" en el servidor';

  return (
    <tr>
      <td className="font-monospace fw-bold">{usuario.documento || '—'}</td>
      <td className="fw-bold">
        {usuario.nombre} {usuario.apellido}
        {esAdminPrincipal && (
          <span className="badge bg-dark ms-2" title={tituloProtegido}>
            <i className="fas fa-shield-alt me-1"></i>Admin principal
          </span>
        )}
      </td>
      {source === 'usuarios' && <td>{usuario.email || '—'}</td>}
      {source === 'usuarios' && <td>{usuario.telefono || '—'}</td>}
      {source === 'usuarios' && (
        <td>
          {isAdmin && !esAdminPrincipal ? (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => onCambiarRol(usuario.id)}
              disabled={esUsuarioActual}
              title={esUsuarioActual ? 'No puedes cambiar tu propio rol' : 'Cambiar rol'}
            >
              {getRoleName(usuario.rol_id, usuario.rol_nombre) || 'Sin rol'} <i className="fas fa-edit ms-1"></i>
            </button>
          ) : (
            <span className="badge bg-secondary">{getRoleName(usuario.rol_id, usuario.rol_nombre)}</span>
          )}
        </td>
      )}
      <td>
        <span className={`badge ${usuario.estado ? 'bg-success' : 'bg-secondary'}`}>
          {usuario.estado ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td>
        <div className="d-flex gap-1">
          <button className="btn btn-sm btn-outline-info" onClick={() => onVerDetalle(usuario)} title="Ver detalles">
            <i className="fas fa-eye"></i>
          </button>
          {!esUsuarioActual && !esAdminPrincipal && (
            <Link to={`/admin/usuarios/editar/${usuario.id}`} className="btn btn-sm btn-outline-primary" title="Editar">
              <i className="fas fa-edit"></i>
            </Link>
          )}
          <button
            className={`btn btn-sm ${usuario.estado ? 'btn-outline-warning' : 'btn-outline-success'}`}
            onClick={() => onToggleEstado(usuario.id, usuario.nombre, usuario.estado)}
            disabled={esUsuarioActual || esAdminPrincipal}
            title={esAdminPrincipal ? tituloProtegido : (esUsuarioActual ? 'No puedes cambiar tu propio estado' : (usuario.estado ? 'Desactivar' : 'Activar'))}
          >
            <i className={`fas fa-toggle-${usuario.estado ? 'off' : 'on'}`}></i>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UsuarioRow;
