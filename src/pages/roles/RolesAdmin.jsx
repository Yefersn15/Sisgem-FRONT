// src/pages/roles/RolesAdmin.jsx
import { Link } from 'react-router-dom';
import { useRolesAdmin } from './hooks/useRolesAdmin';
import RoleRow from './components/RoleRow';
import { useAyudaPagina } from '../../hooks/useAyudaPagina';

const RolesAdmin = () => {
  useAyudaPagina({
    titulo: 'Roles',
    contenido: <p>Define qué puede ver y hacer cada tipo de usuario del panel admin, marcando permisos por módulo. El rol "por defecto" es el que se asigna a un usuario nuevo que se registra.</p>,
  });
  const {
    roles,
    showPermisos,
    toggleShowPermisos,
    categoriasPermisos,
    handleDelete,
    getPermisosAsignados,
  } = useRolesAdmin();

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Gestión de Roles</h2>
          <p className="text-muted mb-0">Administra los roles y permisos del sistema</p>
        </div>
        <Link to="/admin/roles/nuevo" className="btn btn-primary">
          <i className="fas fa-plus me-1"></i>Nuevo Rol
        </Link>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Permisos</th>
                  <th>Por defecto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {roles.map(r => (
                  <RoleRow
                    key={r.id}
                    rol={r}
                    showPermisos={showPermisos === r.id}
                    onTogglePermisos={toggleShowPermisos}
                    onDelete={handleDelete}
                    getPermisosAsignados={getPermisosAsignados}
                    categoriasPermisos={categoriasPermisos}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {roles.length === 0 && (
        <div className="alert alert-info text-center mt-3">
          No hay roles registrados. Crea el primer rol con permisos.
        </div>
      )}
    </div>
  );
};

export default RolesAdmin;
