import FiltrosBar from '../../../components/FiltrosBar';

const UsuariosAdminFiltros = ({ source, search, setSearch, roles, filterRol, setFilterRol, clearFilters }) => (
  <FiltrosBar onClear={clearFilters}>
    <div className="col-12 col-md-4">
      <input
        className="form-control"
        placeholder="Buscar por nombre o email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
    {source === 'usuarios' && (
      <div className="col-6 col-md">
        <select className="form-select" value={filterRol} onChange={(e) => setFilterRol(e.target.value)}>
          <option value="">Todos los roles</option>
          {roles.map(r => (
            <option key={r.id} value={r.id}>{r.nombre}</option>
          ))}
        </select>
      </div>
    )}
  </FiltrosBar>
);

export default UsuariosAdminFiltros;
