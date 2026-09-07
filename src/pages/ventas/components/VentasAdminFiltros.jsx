const VentasAdminFiltros = ({ filterEstado, setFilterEstado, filterMetodo, setFilterMetodo, query, setQuery, clearFilters }) => (
  <div className="card mb-4">
    <div className="card-body">
      <div className="row g-3">
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="por_validar">Por validar</option>
            <option value="completada">Completada</option>
            <option value="anulada">Anulada</option>
            <option value="rechazada">Rechazada</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterMetodo}
            onChange={(e) => setFilterMetodo(e.target.value)}
          >
            <option value="">Todos los métodos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Abono">Abono</option>
          </select>
        </div>
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Buscar por ID, usuario o teléfono..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <button className="btn btn-secondary w-100" onClick={clearFilters}>
            <i className="fas fa-eraser me-1"></i>Limpiar
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default VentasAdminFiltros;
