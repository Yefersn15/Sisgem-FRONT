import { Link } from 'react-router-dom';

const ES_NOMBRE_ADMIN = ['ADMIN', 'ADMINISTRADOR'];

const UsuarioRow = ({ usuario, source, currentUser, isAdmin, getRoleName, onVerDetalle, onCambiarRol, onToggleEstado }) => {
  const esUsuarioActual = currentUser && currentUser.documento === usuario.documento;
  const esAdminPrincipal = usuario.esAdminPrincipal;
  const tituloProtegido = 'Cuenta del administrador principal (definida en .env) — se gestiona con "npm run seed:db" en el servidor';
  // Un admin normal no puede tocar la cuenta de OTRO admin (rol, estado, ni
  // editarla): esa capacidad queda reservada al admin principal, igual que
  // el backend ya la rechaza (ver usuarios.service.js) — esto solo evita
  // mostrar un botón que de todos modos terminaría en un 403.
  const esTargetAdmin = ES_NOMBRE_ADMIN.includes(usuario.rol_nombre);
  const soloPrincipalPuedeTocar = esTargetAdmin && !esAdminPrincipal && !esUsuarioActual && !currentUser?.esAdminPrincipal;
  const tituloSoloPrincipal = 'Solo el administrador principal puede modificar la cuenta de otro administrador';

  return (
    <tr>
      <td className="font-monospace fw-bold">{usuario.documento || '—'}</td>
      <td className="fw-bold">
        <div className="d-flex align-items-center gap-2">
          {usuario.fotoUrl ? (
            <img
              src={usuario.fotoUrl}
              alt=""
              className="rounded-circle flex-shrink-0"
              style={{ width: 32, height: 32, objectFit: 'cover' }}
            />
          ) : (
            <div
              className="rounded-circle bg-secondary-subtle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 32, height: 32 }}
            >
              <i className="fas fa-user text-muted" style={{ fontSize: 12 }}></i>
            </div>
          )}
          <span>{usuario.nombre} {usuario.apellido}</span>
          {esAdminPrincipal && (
            <span className="badge bg-dark" title={tituloProtegido}>
              <i className="fas fa-shield-alt me-1"></i>Admin principal
            </span>
          )}
        </div>
      </td>
      {source === 'usuarios' && <td>{usuario.email || '—'}</td>}
      {source === 'usuarios' && <td>{usuario.telefono || '—'}</td>}
      {source === 'usuarios' && (
        <td>
          {isAdmin && !esAdminPrincipal ? (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => onCambiarRol(usuario.id)}
              disabled={esUsuarioActual || soloPrincipalPuedeTocar}
              title={esUsuarioActual ? 'No puedes cambiar tu propio rol' : (soloPrincipalPuedeTocar ? tituloSoloPrincipal : 'Cambiar rol')}
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
          {!esUsuarioActual && !esAdminPrincipal && !soloPrincipalPuedeTocar && (
            <Link to={`/admin/usuarios/editar/${usuario.id}`} className="btn btn-sm btn-outline-primary" title="Editar">
              <i className="fas fa-edit"></i>
            </Link>
          )}
          <button
            className={`btn btn-sm ${usuario.estado ? 'btn-outline-warning' : 'btn-outline-success'}`}
            onClick={() => onToggleEstado(usuario.id, usuario.nombre, usuario.estado)}
            disabled={esUsuarioActual || esAdminPrincipal || soloPrincipalPuedeTocar}
            title={esAdminPrincipal ? tituloProtegido : (esUsuarioActual ? 'No puedes cambiar tu propio estado' : (soloPrincipalPuedeTocar ? tituloSoloPrincipal : (usuario.estado ? 'Desactivar' : 'Activar')))}
          >
            <i className={`fas fa-toggle-${usuario.estado ? 'off' : 'on'}`}></i>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UsuarioRow;
