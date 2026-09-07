// src/pages/roles/RoleCreate.jsx
import { useNavigate } from 'react-router-dom';
import { useRoleForm } from './hooks/useRoleForm';
import PermisosGrid from './components/PermisosGrid';

const RoleCreate = () => {
  const navigate = useNavigate();
  const {
    nombre, setNombre,
    descripcion, setDescripcion,
    esDefault, setEsDefault,
    permisos, togglePermiso, toggleCategoria,
    categoriasPermisos,
    loading,
    handleSubmit,
  } = useRoleForm();

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h4>Crear Nuevo Rol</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nombre del Rol *</label>
              <input
                type="text"
                className="form-control"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: CAJERO, BODEGUERO, REPARTIDOR"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-control"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción opcional del rol"
                rows={2}
              />
            </div>

            <div className="mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="esDefault"
                  checked={esDefault}
                  onChange={(e) => setEsDefault(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="esDefault">
                  <strong>Rol por defecto</strong> - Se asignará automáticamente a nuevos usuarios al registrarse
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Permisos del Rol</label>
              <PermisosGrid
                categoriasPermisos={categoriasPermisos}
                permisosSeleccionados={permisos}
                onTogglePermiso={togglePermiso}
                onToggleCategoria={toggleCategoria}
                idPrefix="new"
              />
              <small className="text-muted">
                Permisos seleccionados: {permisos.length}
              </small>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Rol'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/roles')}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoleCreate;
