// src/pages/usuarios/UsuariosAdmin.jsx
import { Link } from 'react-router-dom';
import { useUsersList } from './hooks/useUsersList';
import RoleChangeModal from './components/RoleChangeModal';
import UsuarioDetalleModal from './components/UsuarioDetalleModal';
import UsuariosAdminFiltros from './components/UsuariosAdminFiltros';
import UsuarioRow from './components/UsuarioRow';
import Pagination from '../../components/Pagination';
import { useAyudaPagina } from '../../hooks/useAyudaPagina';

const UsuariosAdmin = ({ source = 'usuarios' }) => {
  useAyudaPagina({
    titulo: 'Usuarios',
    contenido: <p>Gestiona las cuentas registradas: cambia su rol, actívalas o desactívalas. La cuenta marcada como "Admin principal" está protegida y solo se administra desde el servidor.</p>,
  });
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
    currentPage,
    setCurrentPage,
    totalPages,
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
    paginatedItems,
    getRoleName,
  } = useUsersList(source);

  const onImportChange = (e) => {
    const file = e.target.files[0];
    handleImport(file);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2>{source === 'usuarios' ? 'Gestión de Usuarios' : 'Usuarios'}</h2>
          <p className="text-muted mb-0">{usuarios.length} registros</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary" onClick={loadData} title="Actualizar">
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
            <i className="fas fa-plus me-1"></i>Nuevo Usuario
          </Link>
        </div>
      </div>

      {importStatus.message && (
        <div className={`alert alert-${importStatus.type}`}>{importStatus.message}</div>
      )}

      <UsuariosAdminFiltros
        source={source}
        search={search}
        setSearch={setSearch}
        roles={roles}
        filterRol={filterRol}
        setFilterRol={setFilterRol}
        clearFilters={clearFilters}
      />

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
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
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={source === 'usuarios' ? 7 : 4} className="text-center text-muted py-4">
                      No hay usuarios registrados
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map(u => (
                    <UsuarioRow
                      key={u.id}
                      usuario={u}
                      source={source}
                      currentUser={currentUser}
                      isAdmin={isAdmin}
                      getRoleName={getRoleName}
                      onVerDetalle={setShowDetalleModal}
                      onCambiarRol={setShowRoleModal}
                      onToggleEstado={handleToggle}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

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

export default UsuariosAdmin;
