import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductosPorCategoria } from './hooks/useProductosPorCategoria';
import ProductoCard from './components/ProductoCard';
import ProductoDetalleModal from './components/ProductoDetalleModal';

const ProductosPorCategoria = () => {
  const { id } = useParams();
  const {
    categoria,
    productos,
    allProductos,
    brandFilter,
    setBrandFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    loading,
    handleDelete,
    handleToggleActivo,
  } = useProductosPorCategoria(id);
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

  if (!categoria) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">Categoría no encontrada</div>
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
        <div className="col-md-12">
          <h2 className="mb-2">{categoria.nombre}</h2>
          {categoria.descripcion && <p className="text-muted">{categoria.descripcion}</p>}
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h4 className="mb-0">Productos</h4>
        <div className="d-flex gap-2 align-items-center">
          <select className="form-select" style={{ minWidth: 180 }} value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
            <option value="">Todas las marcas</option>
            {[...new Set(allProductos.map(p => p.marcaId))].map(brandId => {
              const sample = allProductos.find(x => String(x.marcaId) === String(brandId));
              return sample ? <option key={brandId} value={brandId}>{sample.marcaNombre || 'Desconocida'}</option> : null;
            })}
          </select>
          <input type="text" className="form-control" placeholder="Buscar en esta categoría..." style={{ minWidth: 220 }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
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
        <div className="alert alert-info text-center">No hay productos en esta categoría.</div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {productos.map((prod) => (
            <ProductoCard
              key={prod.id}
              producto={prod}
              onClick={() => setSelectedProducto(prod)}
              metaLabel={prod.marcaNombre}
              metaIcon="fa-industry"
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

export default ProductosPorCategoria;
