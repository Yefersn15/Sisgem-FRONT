// src/pages/roles/RolesList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRoles, deleteRol, getPermisosDisponibles } from '../../services/dataService';

const RolesList = () => {
  const [roles, setRoles] = useState([]);
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);
  const [showPermisos, setShowPermisos] = useState(null);

  const loadData = async () => {
    const [rolesData, permisosData] = await Promise.all([getRoles(), getPermisosDisponibles()]);
    setRoles(rolesData);
    setPermisosDisponibles(permisosData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este rol? Los usuarios con este rol perderán acceso.')) {
      try {
        await deleteRol(id);
        await loadData();
      } catch (err) {
        alert('Error al eliminar: ' + err.message);
      }
    }
  };

  const getPermisosAsignados = (rol) => {
    return rol.permisos || [];
  };

  const getPermisosPorCategoria = () => {
    const categorias = {};
    permisosDisponibles.forEach(p => {
      const [categoria] = p.split('.');
      if (!categorias[categoria]) categorias[categoria] = [];
      categorias[categoria].push(p);
    });
    return categorias;
  };

  const categoriasPermisos = getPermisosPorCategoria();

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Gestión de Roles</h2>
        <Link to="/admin/roles/nuevo" className="btn btn-primary">Nuevo Rol</Link>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Permisos</th>
                <th>Por Defecto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(r => (
                <React.Fragment key={r.id}>
                  <tr>
                    <td className="font-monospace" style={{ fontSize: '0.75rem' }}>{r.id}</td>
                    <td className="fw-bold">{r.nombre}</td>
                    <td>{r.descripcion || '—'}</td>
                    <td>
                      <span className="badge bg-secondary">{getPermisosAsignados(r).length} permisos</span>
                    </td>
                    <td>
                      {r.es_default ? (
                        <span className="badge bg-primary">Por defecto</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${r.estado ? 'bg-success' : 'bg-secondary'}`}>
                        {r.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className={`btn btn-sm ${showPermisos === r.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => setShowPermisos(showPermisos === r.id ? null : r.id)}
                          title="Ver Permisos"
                        >
                          <i className="fas fa-key"></i>
                        </button>
                        <Link to={`/admin/roles/editar/${r.id}`} className="btn btn-sm btn-outline-primary">
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(r.id)}
                          title="Eliminar"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {showPermisos === r.id && (
                    <tr>
                      <td colSpan="7" className="bg-light">
                        <div className="p-3">
                          <h6>Permisos de {r.nombre}:</h6>
                          <div className="row">
                            {Object.entries(categoriasPermisos).map(([categoria, permisos]) => (
                              <div key={categoria} className="col-md-4 mb-3">
                                <div className="card border-secondary">
                                  <div className="card-header bg-light border-secondary py-2 fw-bold text-dark">
                                    {categoria.toUpperCase()}
                                  </div>
                                  <div className="card-body py-2">
                                    {permisos.map(p => (
                                      <div key={p} className="form-check">
                                        <input
                                          type="checkbox"
                                          className="form-check-input"
                                          id={`${r.id}-${p}`}
                                          checked={getPermisosAsignados(r).includes(p)}
                                          disabled
                                        />
                                        <label className={`form-check-label fw-bold ${getPermisosAsignados(r).includes(p) ? 'text-white bg-success px-2 rounded' : 'text-muted'}`} htmlFor={`${r.id}-${p}`} style={{ fontSize: '0.8rem' }}>
                                          {p.split('.')[1].replace('read', 'LEER').replace('write', 'ESCRIBIR').replace('delete', 'ELIMINAR')}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
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

export default RolesList;