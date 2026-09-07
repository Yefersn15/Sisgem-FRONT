const ProductosAdminFiltros = ({
  marcas,
  categorias,
  filterMarca,
  setFilterMarca,
  filterCategoria,
  setFilterCategoria,
  filterEstado,
  setFilterEstado,
  sortBy,
  setSortBy,
  query,
  setQuery,
  clearFilters,
}) => (
  <div className="card mb-4">
    <div className="card-body">
      <div className="row g-3">
        <div className="col-md-2">
          <select className="form-select" value={filterMarca} onChange={(e) => setFilterMarca(e.target.value)}>
            <option value="">Todas las marcas</option>
            {marcas.map(m => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select" value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="nombre-asc">Nombre (A-Z)</option>
            <option value="nombre-desc">Nombre (Z-A)</option>
            <option value="stock-asc">Stock (menor a mayor)</option>
            <option value="stock-desc">Stock (mayor a menor)</option>
            <option value="precio-asc">Precio (menor a mayor)</option>
            <option value="precio-desc">Precio (mayor a menor)</option>
          </select>
        </div>
        <div className="col-md-2">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre o descripción..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
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

export default ProductosAdminFiltros;
