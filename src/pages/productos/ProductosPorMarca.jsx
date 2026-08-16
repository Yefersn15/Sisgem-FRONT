import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductosPorMarca } from './hooks/useProductosPorMarca';
import ProductoCard from './components/ProductoCard';
import ProductoDetalleModal from './components/ProductoDetalleModal';

const ProductosPorMarca = () => {
  const { id } = useParams();
  const {
    marca,
    productos,
    allProductos,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    loading,
    handleDelete,
    handleToggleActivo,
  } = useProductosPorMarca(id);
  const [selectedProducto, setSelectedProducto] = useState(null);

  const onDelete = (productoId, nombre) => {
    handleDelete(productoId, nombre);
    setSelectedProducto(null);
  };

  const onToggleActivo = (productoId, currentActivo, nombre) => {
    handleToggleActivo(productoId, currentActivo, nombre);
    setSelectedProducto((prev) => (prev && String(prev.id) === String(productoId) ? { ...prev, activo: !currentActivo } : prev));
  };

  if (loading) {
    return <div className="container mt-4 text-center"><div className="spinner-border" /></div>;
  }

  if (!marca) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">Marca no encontrada</div>
        <Link to="/productos" className="btn btn-primary">Ver Todos los Productos</Link>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <Link to="/productos" className="btn btn-primary">
            <i className="fas fa-box me-2"></i>Ver Todos los Productos
          </Link>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3 text-center">
          {marca.logoUrl ? (
            <img src={marca.logoUrl} className="img-fluid rounded" alt={marca.nombre} style={{ maxHeight: '150px' }} />
          ) : (
            <i className="fas fa-industry fa-5x text-secondary"></i>
          )}
        </div>
        <div className="col-md-9">
          <h1>{marca.nombre}</h1>
          {marca.descripcion && <p className="lead">{marca.descripcion}</p>}
          {marca.sitioWeb && (
            <p><i className="fas fa-globe me-2"></i><a href={marca.sitioWeb} target="_blank" rel="noopener noreferrer">Sitio Web Oficial</a></p>
          )}
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 className="mb-0">Productos de la marca "{marca.nombre}"</h2>
        <div className="d-flex gap-2 align-items-center">
          <select className="form-select" style={{ minWidth: 180 }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">Todas las categorías</option>
            {[...new Set(allProductos.map(p => p.categoriaId))].map(catId => {
              const sample = allProductos.find(x => String(x.categoriaId) === String(catId));
              return sample ? <option key={catId} value={catId}>{sample.categoriaNombre || 'Desconocida'}</option> : null;
            })}
          </select>
          <input type="text" className="form-control" placeholder="Buscar en esta marca..." style={{ minWidth: 220 }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          <select className="form-select" style={{ minWidth: 160 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="">Orden</option>
            <option value="nombre">Nombre (A-Z)</option>
            <option value="-nombre">Nombre (Z-A)</option>
            <option value="precio">Precio (menor a mayor)</option>
            <option value="-precio">Precio (mayor a menor)</option>
            <option value="stock">Stock (mayor a menor)</option>
            <option value="-stock">Stock (menor a mayor)</option>
          </select>
        </div>
      </div>

      {productos.length === 0 ? (
        <div className="alert alert-info text-center">No hay productos en esta marca.</div>
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
          showAdminActions
          onDelete={onDelete}
          onToggleActivo={onToggleActivo}
        />
      )}
    </div>
  );
};

export default ProductosPorMarca;
