// src/pages/roles/RoleEdit.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPermisosDisponibles, getRoleById, updateRol } from '../../services/dataService';

const RoleEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState(true);
  const [esDefault, setEsDefault] = useState(false);
  const [permisos, setPermisos] = useState([]);
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([getPermisosDisponibles(), getRoleById(id)]).then(([perms, rol]) => {
      setPermisosDisponibles(perms);
      if (rol) {
        setNombre(rol.nombre || '');
        setDescripcion(rol.descripcion || '');
        setEstado(rol.estado !== false);
        setEsDefault(rol.es_default === true);
        setPermisos(rol.permisos || []);
      }
      setLoadingData(false);
    });
  }, [id]);

  const getPermisosPorCategoria = () => {
    const categorias = {};
    permisosDisponibles.forEach(p => {
      const [categoria] = p.split('.');
      if (!categorias[categoria]) categorias[categoria] = [];
      categorias[categoria].push(p);
    });
    return categorias;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert('El nombre del rol es requerido');
      return;
    }

    setLoading(true);
    try {
      await updateRol(id, { nombre, descripcion, estado, permisos, es_default: esDefault });
      navigate('/admin/roles');
    } catch (err) {
      alert('Error al actualizar rol: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const togglePermiso = (permiso) => {
    setPermisos(prev =>
      prev.includes(permiso)
        ? prev.filter(p => p !== permiso)
        : [...prev, permiso]
    );
  };

  const toggleCategoria = (categoriaPermisos) => {
    const allSelected = categoriaPermisos.every(p => permisos.includes(p));
    if (allSelected) {
      setPermisos(prev => prev.filter(p => !categoriaPermisos.includes(p)));
    } else {
      setPermisos(prev => [...new Set([...prev, ...categoriaPermisos])]);
    }
  };

  const categoriasPermisos = getPermisosPorCategoria();

  if (loadingData) {
    return <div className="container mt-4">Cargando...</div>;
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
              <div className="row">
                {Object.entries(categoriasPermisos).map(([categoria, perms]) => {
                  const allSelected = perms.every(p => permisos.includes(p));
                  return (
                    <div key={categoria} className="col-md-4 mb-3">
                      <div className="card border-secondary">
                        <div className="card-header bg-light border-secondary py-2 d-flex justify-content-between align-items-center fw-bold text-dark">
                          <span>{categoria.toUpperCase()}</span>
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() => toggleCategoria(perms)}
                            title="Seleccionar todos"
                          />
                        </div>
                        <div className="card-body py-2">
                          {perms.map(p => (
                            <div key={p} className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`edit-${p}`}
                                checked={permisos.includes(p)}
                                onChange={() => togglePermiso(p)}
                              />
                              <label className={`form-check-label fw-bold ${permisos.includes(p) ? 'text-white bg-primary px-2 rounded' : ''}`} htmlFor={`edit-${p}`} style={{ fontSize: '0.85rem' }}>
                                {p.split('.')[1].replace('read', 'LEER').replace('write', 'ESCRIBIR').replace('delete', 'ELIMINAR')}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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