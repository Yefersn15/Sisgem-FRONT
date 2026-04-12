// src/pages/usuarios/UsersList.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getUsuarios,
  getRoles,
  toggleUsuarioEstado,
  updateUsuario,
  exportUsuarios,
  importUsuarios
} from '../../services/dataService';

const UsersList = ({ source = 'usuarios' }) => {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(null);
  const [importStatus, setImportStatus] = useState({ message: '', type: '' });
  const fileRef = useRef(null);

  // Cargar datos
  const loadData = async () => {
    if (source === 'usuarios') {
      const [users, rolesData] = await Promise.all([getUsuarios(), getRoles()]);
      setUsuarios(users);
      setRoles(rolesData);
    } else {
      // Para clientes, usar getClientes (si se necesita)
      // const clientesData = await getClientes();
      // setUsuarios(clientesData);
    }
  };

  useEffect(() => {
    loadData();
  }, [source]);

  const handleToggle = async (id, nombre, estadoActual) => {
    const accion = estadoActual ? 'Desactivar' : 'Activar';
    if (!window.confirm(`¿${accion} el usuario "${nombre}"?`)) return;
    try {
      await toggleUsuarioEstado(id, !estadoActual);
      await loadData(); // Recargar
    } catch (err) {
      alert('Error al cambiar estado: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleRoleChange = async (userId, newRoleId) => {
    try {
      await updateUsuario(userId, { rolId: newRoleId });
      await loadData();
      setShowRoleModal(null);
    } catch (err) {
      alert('Error al cambiar rol');
    }
  };

  const handleExport = async () => {
    await exportUsuarios();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importUsuarios(
      file,
      (count) => {
        setImportStatus({ message: `Importados ${count} usuarios`, type: 'success' });
        loadData();
        if (fileRef.current) fileRef.current.value = '';
        setTimeout(() => setImportStatus({ message: '', type: '' }), 3000);
      },
      (err) => {
        setImportStatus({ message: 'Error importando: ' + (err?.message || err), type: 'danger' });
        setTimeout(() => setImportStatus({ message: '', type: '' }), 5000);
      }
    );
  };

  const filtered = usuarios.filter(u => {
    const matchSearch = !search ||
      (u.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRol = source === 'usuarios' ? (!filterRol || String(u.rol_id) === String(filterRol)) : true;
    return matchSearch && matchRol;
  });

  const getRoleName = (rolId, fallbackName) => {
    if (!rolId && fallbackName) return fallbackName;
    if (!rolId) return 'Sin rol';
    const rol = roles.find(r => String(r.id) === String(rolId));
    return rol ? rol.nombre : (fallbackName || 'Sin rol');
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2>{source === 'usuarios' ? 'Gestión de Usuarios' : 'Usuarios'}</h2>
          <p className="text-muted mb-0">{usuarios.length} registros</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-secondary" onClick={loadData} title="Actualizar">
            <i className="fas fa-sync-alt"></i>
          </button>
          <button className="btn btn-outline-secondary" onClick={handleExport} title="Exportar">
            <i className="fas fa-file-export me-1"></i>Exportar
          </button>
          <input type="file" ref={fileRef} accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImport} />
          <button className="btn btn-outline-secondary" onClick={() => fileRef.current && fileRef.current.click()} title="Importar">
            <i className="fas fa-file-import me-1"></i>Importar
          </button>
          <Link to={source === 'usuarios' ? '/admin/usuarios/nuevo' : '/register'} className="btn btn-primary">
            <i className="fas fa-plus me-1"></i>{source === 'usuarios' ? 'Nuevo Usuario' : 'Nuevo Usuario'}
          </Link>
        </div>
      </div>

      {importStatus.message && (
        <div className={`alert alert-${importStatus.type}`}>{importStatus.message}</div>
      )}

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {source === 'usuarios' && (
              <div className="col-md-4">
                <select className="form-select" value={filterRol} onChange={(e) => setFilterRol(e.target.value)}>
                  <option value="">Todos los roles</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              </div>
            )}
            <div className={`col-md-${source === 'usuarios' ? '2' : '6'}`}>
              <button className="btn btn-secondary w-100" onClick={() => { setSearch(''); setFilterRol(''); }}>
                <i className="fas fa-eraser me-1"></i>Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombre</th>
                {source === 'usuarios' && <th>Email</th>}
                {source === 'usuarios' && <th>Teléfono</th>}
                {source === 'usuarios' && <th>Rol</th>}
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td className="font-monospace fw-bold">{u.documento || '—'}</td>
                  <td className="fw-bold">{u.nombre} {u.apellido}</td>
                  {source === 'usuarios' && <td>{u.email || '—'}</td>}
                  {source === 'usuarios' && <td>{u.telefono || '—'}</td>}
                  {source === 'usuarios' && (
                    <td>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setShowRoleModal(u.id)}
                        disabled={currentUser && currentUser.id === u.id}
                        title={currentUser && currentUser.id === u.id ? 'No puedes cambiar tu propio rol' : 'Cambiar rol'}
                      >
                        {getRoleName(u.rol_id, u.rol_nombre)} <i className="fas fa-edit ms-1"></i>
                      </button>
                    </td>
                  )}
                  <td>
                    <span className={`badge ${u.estado ? 'bg-success' : 'bg-secondary'}`}>
                      {u.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Link to={`/admin/usuarios/editar/${u.id}`} className="btn btn-sm btn-outline-primary" title="Editar">
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button
                        className={`btn btn-sm ${u.estado ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        onClick={() => handleToggle(u.id, u.nombre, u.estado)}
                        disabled={currentUser && currentUser.id === u.id}
                        title={currentUser && currentUser.id === u.id ? 'No puedes cambiar tu propio estado' : (u.estado ? 'Desactivar' : 'Activar')}
                      >
                        <i className={`fas fa-toggle-${u.estado ? 'on' : 'off'}`}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="alert alert-info text-center mt-3">No hay usuarios registrados.</div>
      )}

      {/* Modal Cambio de Rol */}
      {showRoleModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cambiar Rol</h5>
                <button type="button" className="btn-close" onClick={() => setShowRoleModal(null)}></button>
              </div>
              <div className="modal-body">
                <p>Selecciona el nuevo rol para el usuario:</p>
                <div className="d-flex flex-column gap-2">
                  {roles.map(r => (
                    <button
                      key={r.id}
                      className={`btn ${String(usuarios.find(u => u.id === showRoleModal)?.rol_id) === String(r.id) ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => handleRoleChange(showRoleModal, r.id)}
                    >
                      {r.nombre}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;