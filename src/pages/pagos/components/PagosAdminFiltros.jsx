const PagosAdminFiltros = ({ search, setSearch, filterEstadoPago, setFilterEstadoPago, clearFilters }) => (
  <div className="card mb-4">
    <div className="card-body">
      <div className="row g-3">
        <div className="col-md-5">
          <input
            className="form-control"
            placeholder="Buscar por ID, usuario o método de pago"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select className="form-select" value={filterEstadoPago} onChange={(e) => setFilterEstadoPago(e.target.value)}>
            <option value="Todos">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Pagado">Pagado</option>
          </select>
        </div>
        <div className="col-md-3">
          <button className="btn btn-secondary w-100" onClick={clearFilters}>
            <i className="fas fa-eraser me-1"></i>Limpiar
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default PagosAdminFiltros;
