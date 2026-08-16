import { useState } from 'react';
import { useProductosCatalogo } from './hooks/useProductosCatalogo';
import ProductoCard from './components/ProductoCard';
import ProductoDetalleModal from './components/ProductoDetalleModal';

const ProductosList = () => {
  const {
    productos,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterMarca,
    onFilterMarcaChange,
    filterCategoria,
    onFilterCategoriaChange,
    filteredMarcas,
    filteredCategorias,
    clearFilters,
  } = useProductosCatalogo();
  const [selectedProducto, setSelectedProducto] = useState(null);

  return (
    <div className="container my-4">
      <form className="row mb-4" onSubmit={(e) => e.preventDefault()}>
        <div className="col-md-2">
          <select
            className="form-select"
            value={filterMarca}
            onChange={(e) => onFilterMarcaChange(e.target.value)}
          >
            <option value="">Todas las marcas</option>
            {filteredMarcas.map(m => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={filterCategoria}
            onChange={(e) => onFilterCategoriaChange(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {filteredCategorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Ordenar...</option>
            <option value="nombre">Nombre (A-Z)</option>
            <option value="-nombre">Nombre (Z-A)</option>
            <option value="precio">Precio (menor a mayor)</option>
            <option value="-precio">Precio (mayor a menor)</option>
            <option value="stock">Stock (mayor a menor)</option>
            <option value="-stock">Stock (menor a mayor)</option>
          </select>
        </div>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <button type="button" className="btn btn-outline-secondary w-100" onClick={clearFilters}>
            <i className="fas fa-eraser me-1"></i>Limpiar
          </button>
        </div>
      </form>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Catálogo de Productos</h2>
      </div>

      {productos.length === 0 ? (
        <div className="alert alert-info text-center">
          <i className="fas fa-box-open fa-3x mb-3"></i>
          <h4>No hay productos disponibles</h4>
          <p>Comienza agregando el primer producto.</p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {productos.map((prod) => (
            <ProductoCard
              key={prod.id}
              producto={prod}
              onClick={() => setSelectedProducto(prod)}
              metaLabel={prod.categoriaNombre}
              metaIcon="fa-tag"
            />
          ))}
        </div>
      )}

      {selectedProducto && (
        <ProductoDetalleModal
          producto={selectedProducto}
          onClose={() => setSelectedProducto(null)}
          linkableTags
        />
      )}
    </div>
  );
};

export default ProductosList;
