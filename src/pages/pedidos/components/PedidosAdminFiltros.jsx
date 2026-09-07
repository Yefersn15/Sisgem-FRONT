const PedidosAdminFiltros = ({ busqueda, setBusqueda, filterEstado, setFilterEstado, filterMetodo, setFilterMetodo, clearFilters }) => (
  <div className="card mb-4">
    <div className="card-body">
      <div className="row g-3">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Buscar por ID o usuario"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterEstado}
            onChange={e => setFilterEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="enviado">Enviado</option>
            <option value="recibido">Recibido</option>
            <option value="cancelado">Cancelado</option>
            <option value="anulado">Anulado</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterMetodo}
            onChange={e => setFilterMetodo(e.target.value)}
          >
            <option value="">Todos los métodos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Abono">Abono</option>
          </select>
        </div>
        <div className="col-md-2">
          <button className="btn btn-outline-secondary w-100" onClick={clearFilters}>
            <i className="fas fa-eraser me-1"></i>Limpiar
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default PedidosAdminFiltros;
