import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductos, getCategoriaById, getMarcas, deleteProducto, updateProducto, formatPrice } from '../../services/dataService';
import { useCart } from '../../context/CartContext';
import useDebounce from '../../hooks/useDebounce';

// (Reutilizamos la lógica de ProductosList pero filtrada por categoría)
// Para no duplicar, podríamos extraer un componente base. Aquí haremos una versión específica.
const ProductosPorCategoria = () => {
  const { id } = useParams();
  const [categoria, setCategoria] = useState(null);
  const [productos, setProductos] = useState([]);
  const [allProductos, setAllProductos] = useState([]);
  const [brandFilter, setBrandFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalCantidad, setModalCantidad] = useState(1);
  const { addToCart } = useCart();

  const handleDelete = (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar el producto "${nombre}"?`)) {
      deleteProducto(id);
      setProductos(prev => prev.filter(p => p.id !== id));
      setShowModal(false);
      setSelectedProducto(null);
    }
  };

  useEffect(() => {
    (async () => {
      const cat = await getCategoriaById(id);
      setCategoria(cat);
      const todos = await getProductos() || [];
      const filtrados = todos.filter(p => String(p.categoriaId) === String(id));
      const marcas = await getMarcas() || [];
      const enriquecidos = filtrados.map(p => ({
        ...p,
        marcaNombre: (marcas.find(m => String(m.id) === String(p.marcaId)) || {}).nombre || 'Desconocida',
        categoriaNombre: cat?.nombre || 'Desconocida'
      }));
      setAllProductos(enriquecidos);
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    let lista = allProductos.slice();
    if (brandFilter) lista = lista.filter(p => String(p.marcaId) === String(brandFilter));
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      lista = lista.filter(p => (p.nombre || '').toLowerCase().includes(q) || (p.descripcion || '').toLowerCase().includes(q));
    }
    if (sortBy) {
      lista.sort((a, b) => {
        switch (sortBy) {
          case 'nombre': return a.nombre.localeCompare(b.nombre);
          case '-nombre': return b.nombre.localeCompare(a.nombre);
          case 'precio': return a.precioUnitario - b.precioUnitario;
          case '-precio': return b.precioUnitario - a.precioUnitario;
          case 'stock': return b.stockDisponible - a.stockDisponible;
          case '-stock': return a.stockDisponible - b.stockDisponible;
          default: return 0;
        }
      });
    }
    setProductos(lista);
  }, [allProductos, brandFilter, debouncedSearch, sortBy]);

  const handleToggleActivo = (id, currentActivo, nombre) => {
    if (!window.confirm(`¿Deseas ${currentActivo ? 'desactivar' : 'activar'} el producto "${nombre}"?`)) return;
    updateProducto(id, { activo: !currentActivo });
    setAllProductos(prev => prev.map(p => (String(p.id) === String(id) ? { ...p, activo: !currentActivo } : p)));
    setSelectedProducto(prev => prev && String(prev.id) === String(id) ? { ...prev, activo: !currentActivo } : prev);
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
            <div key={prod.id} className="col">
                <div
                  className="card h-100 shadow-sm producto-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setSelectedProducto(prod); setShowModal(true); }}
                >
                <div className="position-relative">
                  {prod.fotoUrl ? (
                    <img src={prod.fotoUrl} className="card-img-top" alt={prod.nombre} style={{ height: '250px', objectFit: 'contain' }} />
                  ) : (
                    <div className="card-img-top d-flex align-items-center justify-content-center bg-light" style={{ height: '250px' }}>
                      <i className="fas fa-image fa-3x text-muted"></i>
                    </div>
                  )}
                  <span className={`badge position-absolute top-0 end-0 m-2 ${prod.stockDisponible > 0 ? 'bg-success' : 'bg-danger'}`}>
                    Stock: {prod.stockDisponible}
                  </span>
                </div>
                <div className="card-body">
                  <h5 className="card-title">{prod.nombre}</h5>
                  <p className="card-text text-muted small">{prod.descripcion}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="text-primary">{formatPrice(prod.precioUnitario)}</strong>
                    <div className="text-muted small">
                      <i className="fas fa-industry me-1"></i>{prod.marcaNombre}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Modal de detalles (similar a ProductosList) */}
      {showModal && selectedProducto && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">{selectedProducto.nombre}</h3>
                <button type="button" className="btn-close" onClick={() => { setShowModal(false); setSelectedProducto(null); }}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-7">
                    <div className="mb-4">
                      <h5 className="text-muted">{selectedProducto.categoriaNombre}</h5>
                      <div className="mb-3">
                        <span className="badge bg-secondary">{selectedProducto.marcaNombre}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p><strong>Código de Barras:</strong> <span className="text-muted">{selectedProducto.barcode || '-'}</span></p>
                      <p><strong>Precio:</strong> <span className="text-primary h5">{formatPrice(selectedProducto.precioUnitario)}</span></p>
                      <p>
                        <strong>Stock:</strong>{' '}
                        <span className={`badge ${selectedProducto.stockDisponible > 0 ? 'bg-success' : 'bg-danger'}`}>
                          {selectedProducto.stockDisponible} unidades
                        </span>
                      </p>
                      <p>
                        <strong>Estado:</strong>{' '}
                        <span className={`badge ${selectedProducto.activo ? 'bg-success' : 'bg-secondary'}`}>
                          {selectedProducto.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </p>
                      {/* Fecha Creación removed */}
                    </div>

                    <hr />

                    <div className="mb-4">
                      <h5>Descripción</h5>
                      <p className="text-justify">{selectedProducto.descripcion}</p>
                    </div>

                    <div className="mt-4 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-1">
                        <Link to={`/productos/editar/${selectedProducto.id}`} className="btn btn-outline-primary btn-sm" title="Editar" onClick={() => { setShowModal(false); setSelectedProducto(null); }}>
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button className={`btn btn-sm ${selectedProducto.activo ? 'btn-outline-warning' : 'btn-outline-success'}`} title={selectedProducto.activo ? 'Desactivar' : 'Activar'} onClick={() => { handleToggleActivo(selectedProducto.id, selectedProducto.activo, selectedProducto.nombre); }}>
                          <i className={`fas fa-toggle-${selectedProducto.activo ? 'on' : 'off'}`}></i>
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          title="Eliminar"
                          onClick={() => {
                            handleDelete(selectedProducto.id, selectedProducto.nombre);
                          }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                      {selectedProducto.stockDisponible > 0 && (
                        <div className="d-flex align-items-center">
                          <input
                            type="number"
                            className="form-control me-2"
                            style={{ width: '50px' }}
                            min={1}
                            max={selectedProducto.stockDisponible}
                            value={modalCantidad}
                            onChange={(e) => {
                              const v = parseInt(e.target.value || '1', 10);
                              setModalCantidad(Math.max(1, Math.min(selectedProducto.stockDisponible, isNaN(v) ? 1 : v)));
                            }}
                          />
                          <button className="btn btn-primary btn-sm" aria-label="Agregar al carrito" onClick={() => { addToCart(selectedProducto.id, modalCantidad); alert('Producto agregado al carrito'); setShowModal(false); setSelectedProducto(null); }}>
                            <i className="fas fa-cart-plus"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-5 text-center">
                    {selectedProducto.fotoUrl ? (
                      <img src={selectedProducto.fotoUrl} className="img-fluid rounded shadow mb-3" alt={selectedProducto.nombre} style={{ maxHeight: '300px', width: 'auto', objectFit: 'contain' }} />
                    ) : (
                      <div className="text-muted" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-image fa-5x"></i>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductosPorCategoria;