// src/pages/roles/RolesList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRoles, deleteRol, getPermisosDisponibles } from './services/rolesService';
import { usePermisosPorCategoria } from './hooks/usePermisosPorCategoria';
import PermisosViewer from './components/PermisosViewer';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const RolesList = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [roles, setRoles] = useState([]);
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);
  const [showPermisos, setShowPermisos] = useState(null);
  const categoriasPermisos = usePermisosPorCategoria(permisosDisponibles);

  const loadData = async () => {
    const [rolesData, permisosData] = await Promise.all([getRoles(), getPermisosDisponibles()]);
    setRoles(rolesData);
    setPermisosDisponibles(permisosData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id, nombre) => {
    if (nombre?.toUpperCase() === 'ADMIN' || nombre?.toUpperCase() === 'ADMINISTRADOR') {
      toast.error('El rol de Administrador no puede ser eliminado.');
      return;
    }
    if (await confirm('¿Eliminar este rol? Los usuarios con este rol perderán acceso.')) {
      try {
        await deleteRol(id);
        await loadData();
      } catch (err) {
        toast.error('Error al eliminar: ' + err.message);
      }
    }
  };

  const getPermisosAsignados = (rol) => rol.permisos || [];

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
                  <React.Fragment key={r.id}>
                    <tr>
                      <td className="fw-bold">{r.nombre}</td>
                      <td>{r.descripcion || '—'}</td>
                      <td>
                        <span className="badge bg-secondary">{getPermisosAsignados(r).length} permisos</span>
                      </td>
                      <td>
                        {r.esDefault ? (
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
                            className={`btn btn-sm ${showPermisos === r.id ? 'btn-primary' : 'btn-outline-info'}`}
                            onClick={() => setShowPermisos(showPermisos === r.id ? null : r.id)}
                            title="Ver permisos"
                          >
                            <i className="fas fa-key"></i>
                          </button>
                          <Link to={`/admin/roles/editar/${r.id}`} className="btn btn-sm btn-outline-primary">
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(r.id, r.nombre)}
                            title="Eliminar"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {showPermisos === r.id && (
                      <tr>
                        <td colSpan="6" className="bg-light">
                          <PermisosViewer rol={r} categoriasPermisos={categoriasPermisos} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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

export default RolesList;
