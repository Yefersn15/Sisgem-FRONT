// src/pages/roles/RoleEdit.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPermisosDisponibles, getRoleById, updateRol } from './services/rolesService';
import { usePermisosPorCategoria } from './hooks/usePermisosPorCategoria';
import { usePermisosSelector } from './hooks/usePermisosSelector';
import PermisosGrid from './components/PermisosGrid';
import { useToast } from '../../context/ToastContext';
import LoadingState from '../../shared/components/common/LoadingState';

const RoleEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState(true);
  const [esDefault, setEsDefault] = useState(false);
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { permisos, setPermisos, togglePermiso, toggleCategoria } = usePermisosSelector([]);
  const categoriasPermisos = usePermisosPorCategoria(permisosDisponibles);

  useEffect(() => {
    Promise.all([getPermisosDisponibles(), getRoleById(id)]).then(([perms, rol]) => {
      setPermisosDisponibles(perms);
      if (rol) {
        setNombre(rol.nombre || '');
        setDescripcion(rol.descripcion || '');
        setEstado(rol.estado !== false);
        setEsDefault(rol.esDefault === true);
        setPermisos(rol.permisos || []);

        // Verificar si es el rol de administrador
        if (rol.nombre?.toUpperCase() === 'ADMIN' || rol.nombre?.toUpperCase() === 'ADMINISTRADOR') {
          toast.error('El rol de Administrador no puede ser editado.');
          navigate('/admin/roles');
        }
      }
      setLoadingData(false);
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error('El nombre del rol es requerido');
      return;
    }

    setLoading(true);
    try {
      await updateRol(id, { nombre, descripcion, estado, permisos, esDefault });
      navigate('/admin/roles');
    } catch (err) {
      toast.error('Error al actualizar rol: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="container mt-4"><LoadingState /></div>;
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h4>Editar Rol</h4>
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
                  id="estado"
                  checked={estado}
                  onChange={(e) => setEstado(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="estado">
                  Rol Activo
                </label>
              </div>
              <div className="form-check mt-2">
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
                idPrefix="edit"
              />
              <small className="text-muted">
                Permisos seleccionados: {permisos.length}
              </small>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Cambios'}
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

export default RoleEdit;
