// src/pages/usuarios/UsersList.jsx
import { Link } from 'react-router-dom';
import { useUsersList } from './hooks/useUsersList';
import RoleChangeModal from './components/RoleChangeModal';
import UsuarioDetalleModal from './components/UsuarioDetalleModal';

const UsersList = ({ source = 'usuarios' }) => {
  const {
    currentUser,
    isAdmin,
    usuarios,
    roles,
    search,
    setSearch,
    filterRol,
    setFilterRol,
    clearFilters,
    showRoleModal,
    setShowRoleModal,
    showDetalleModal,
    setShowDetalleModal,
    importStatus,
    fileRef,
    loadData,
    handleToggle,
    handleRoleChange,
    handleExport,
    handleImport,
    filtered,
    getRoleName,
  } = useUsersList(source);

  const onImportChange = (e) => {
    const file = e.target.files[0];
    handleImport(file);
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
          <input type="file" ref={fileRef} accept=".xlsx,.xls" style={{ display: 'none' }} onChange={onImportChange} />
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
              <button className="btn btn-secondary w-100" onClick={clearFilters}>
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
                      {isAdmin ? (
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setShowRoleModal(u.id)}
                          disabled={currentUser && currentUser.documento === u.documento}
                          title={currentUser && currentUser.documento === u.documento ? 'No puedes cambiar tu propio rol' : 'Cambiar rol'}
                        >
                          {getRoleName(u.rol_id, u.rol_nombre) || 'Sin rol'} <i className="fas fa-edit ms-1"></i>
                        </button>
                      ) : (
                        <span className="badge bg-secondary">{getRoleName(u.rol_id, u.rol_nombre)}</span>
                      )}
                    </td>
                  )}
                  <td>
                    <span className={`badge ${u.estado ? 'bg-success' : 'bg-secondary'}`}>
                      {u.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-info" onClick={() => setShowDetalleModal(u)} title="Ver detalles">
                        <i className="fas fa-eye"></i>
                      </button>
                      {currentUser && currentUser.documento !== u.documento && (
                        <Link to={`/admin/usuarios/editar/${u.id}`} className="btn btn-sm btn-outline-primary" title="Editar">
                          <i className="fas fa-edit"></i>
                        </Link>
                      )}
                      <button
                        className={`btn btn-sm ${u.estado ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        onClick={() => handleToggle(u.id, u.nombre, u.estado)}
                        disabled={currentUser && currentUser.documento === u.documento}
                        title={currentUser && currentUser.documento === u.documento ? 'No puedes cambiar tu propio estado' : (u.estado ? 'Desactivar' : 'Activar')}
                      >
                        <i className={`fas fa-toggle-${u.estado ? 'off' : 'on'}`}></i>
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

      {showRoleModal && (
        <RoleChangeModal
          roles={roles}
          usuario={usuarios.find(u => u.id === showRoleModal)}
          onSelectRole={(roleId) => handleRoleChange(showRoleModal, roleId)}
          onClose={() => setShowRoleModal(null)}
        />
      )}

      {showDetalleModal && (
        <UsuarioDetalleModal
          usuario={showDetalleModal}
          getRoleName={getRoleName}
          onClose={() => setShowDetalleModal(null)}
        />
      )}
    </div>
  );
};

export default UsersList;
