import FiltrosBar from '../../../components/FiltrosBar';

const MarcasAdminFiltros = ({ filterEstado, setFilterEstado, sortBy, setSortBy, query, setQuery, clearFilters }) => (
  <FiltrosBar onClear={clearFilters}>
    <div className="col-12 col-md-4">
      <input
        type="text"
        className="form-control"
        placeholder="Buscar por nombre, descripción o ID..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
    <div className="col-6 col-md">
      <select
        className="form-select"
        value={filterEstado}
        onChange={(e) => setFilterEstado(e.target.value)}
      >
        <option value="">Todos los estados</option>
        <option value="activa">Activas</option>
        <option value="inactiva">Inactivas</option>
      </select>
    </div>
    <div className="col-6 col-md">
      <select
        className="form-select"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="nombre-asc">Nombre (A-Z)</option>
        <option value="nombre-desc">Nombre (Z-A)</option>
        <option value="id-asc">ID (menor a mayor)</option>
        <option value="id-desc">ID (mayor a menor)</option>
        <option value="productos-asc">Productos (menos a más)</option>
        <option value="productos-desc">Productos (más a menos)</option>
      </select>
    </div>
  </FiltrosBar>
);

export default MarcasAdminFiltros;
