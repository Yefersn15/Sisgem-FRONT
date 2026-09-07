const UsuariosAdminFiltros = ({ source, search, setSearch, roles, filterRol, setFilterRol, clearFilters }) => (
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
);

export default UsuariosAdminFiltros;
