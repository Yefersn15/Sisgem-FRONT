import FiltrosBar from '../../../components/FiltrosBar';

const PagosAdminFiltros = ({ search, setSearch, filterEstadoPago, setFilterEstadoPago, clearFilters }) => (
  <FiltrosBar onClear={clearFilters}>
    <div className="col-12 col-md-4">
      <input
        className="form-control"
        placeholder="Buscar por ID, usuario o método de pago..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
    <div className="col-6 col-md">
      <select className="form-select" value={filterEstadoPago} onChange={(e) => setFilterEstadoPago(e.target.value)}>
        <option value="Todos">Todos los estados</option>
        <option value="Pendiente">Pendiente</option>
        <option value="Pagado">Pagado</option>
      </select>
    </div>
  </FiltrosBar>
);

export default PagosAdminFiltros;
