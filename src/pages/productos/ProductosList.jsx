import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useDebounce from '../../hooks/useDebounce';
import { getProductos, getMarcas, getCategorias, formatPrice } from '../../services/dataService';
import { useCart } from '../../context/CartContext';

const ProductosList = () => {
  const [productos, setProductos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalCantidad, setModalCantidad] = useState(1);
  const [filterMarca, setFilterMarca] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filteredMarcas, setFilteredMarcas] = useState([]);
  const [filteredCategorias, setFilteredCategorias] = useState([]);

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Cargar datos
  useEffect(() => {
    const init = async () => {
      const mar = await getMarcas();
      const cat = await getCategorias();
      setMarcas(Array.isArray(mar) ? mar : mar || []);
      setCategorias(Array.isArray(cat) ? cat : cat || []);
      setFilteredMarcas(Array.isArray(mar) ? mar : mar || []);
      setFilteredCategorias(Array.isArray(cat) ? cat : cat || []);
      await cargarProductos(mar, cat);
    };
    init();
  }, []);

  // Recargar cuando cambien búsqueda o filtro
  useEffect(() => {
    cargarProductos();
  }, [debouncedSearch, sortBy, filterMarca, filterCategoria]);

  const cargarProductos = async (marcasLocalParam, categoriasLocalParam) => {
    let lista = await getProductos();
    if (!Array.isArray(lista)) lista = lista && lista.data ? lista.data : (lista || []);

    // Usar marcas/categorias pasadas o recargar desde servicio para asegurar consistencia
    const marcasLocal = marcasLocalParam || await getMarcas();
    const categoriasLocal = categoriasLocalParam || await getCategorias();

    // Enriquecer con nombres de marca y categoría
    lista = (lista || []).map(p => ({
      ...p,
      marcaNombre: (marcasLocal || []).find(m => String(m.id) === String(p.marcaId))?.nombre || 'Desconocida',
      categoriaNombre: (categoriasLocal || []).find(c => String(c.id) === String(p.categoriaId))?.nombre || 'Desconocida'
    }));

    // Filtrar por marca
    if (filterMarca) {
      lista = lista.filter(p => String(p.marcaId) === String(filterMarca));
    }

    // Filtrar por categoría
    if (filterCategoria) {
      lista = lista.filter(p => String(p.categoriaId) === String(filterCategoria));
    }

    // Búsqueda
    if (debouncedSearch) {
      lista = lista.filter(p =>
        p.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Actualizar opciones de filtros según productos mostrados
    if (!filterMarca && !filterCategoria && lista.length > 0) {
      const catsConProductos = [...new Set(lista.map(p => p.categoriaId))].filter(Boolean);
      const marsConProductos = [...new Set(lista.map(p => p.marcaId))].filter(Boolean);
      const catsFiltradas = (categoriasLocal || []).filter(c => catsConProductos.includes(String(c.id)));
      const marsFiltradas = (marcasLocal || []).filter(m => marsConProductos.includes(String(m.id)));
      setFilteredMarcas(marsFiltradas);
      setFilteredCategorias(catsFiltradas);
    } else if (filterMarca && !filterCategoria) {
      // Si hay marca seleccionada, mostrar solo categorías que tienen productos de esa marca
      const catsConMarca = [...new Set(lista.map(p => p.categoriaId))].filter(Boolean);
      const catsFiltradas = (categoriasLocal || []).filter(c => catsConMarca.includes(String(c.id)));
      setFilteredCategorias(catsFiltradas);
    } else if (filterCategoria && !filterMarca) {
      // Si hay categoría seleccionada, mostrar solo marcas que tienen productos de esa categoría
      const marsConCategoria = [...new Set(lista.map(p => p.marcaId))].filter(Boolean);
      const marsFiltradas = (marcasLocal || []).filter(m => marsConCategoria.includes(String(m.id)));
      setFilteredMarcas(marsFiltradas);
    }

    // Ordenamiento
    if (sortBy) {
      lista.sort((a, b) => {
        switch (sortBy) {
          case 'nombre':
            return a.nombre.localeCompare(b.nombre);
          case '-nombre':
            return b.nombre.localeCompare(a.nombre);
          case 'precio':
            return a.precioUnitario - b.precioUnitario;
          case '-precio':
            return b.precioUnitario - a.precioUnitario;
          case 'stock':
            return b.stockDisponible - a.stockDisponible;
          case '-stock':
            return a.stockDisponible - b.stockDisponible;
          default:
            return 0;
        }
      });
    }

    setProductos(lista);
  };

  const openModal = (producto) => {
    setSelectedProducto(producto);
    setShowModal(true);
    setModalCantidad(1);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProducto(null);
  };

  const { addToCart } = useCart();

  return (
    <div className="container my-4">
      {/* Barra de búsqueda y filtros */}
      <form className="row mb-4" onSubmit={(e) => e.preventDefault()}>
        <div className="col-md-2">
          <select
            className="form-select"
            value={filterMarca}
            onChange={(e) => {
              setFilterMarca(e.target.value);
              if (!e.target.value) setFilterCategoria('');
            }}
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
            onChange={(e) => {
              setFilterCategoria(e.target.value);
              if (!e.target.value) setFilterMarca('');
            }}
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
          <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={() => {
              setSearchQuery('');
              setSortBy('');
              setFilterMarca('');
              setFilterCategoria('');
            }}
          >
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
            <div key={prod.id} className="col">
              <div
                className={`card h-100 shadow-sm producto-card productCard`}
                style={{ cursor: 'pointer' }}
                onClick={() => openModal(prod)}
              >
                <div className="position-relative">
                  {prod.fotoUrl ? (
                    <img
                      src={prod.fotoUrl}
                      className={`card-img-top productImage`}
                      alt={prod.nombre}
                      style={{ height: '250px', objectFit: 'contain', backgroundColor: 'var(--surface2)' }}
                    />
                  ) : (
                    <div className="card-img-top d-flex align-items-center justify-content-center bg-light" style={{ height: '250px' }}>
                      <i className="fas fa-image fa-3x text-muted"></i>
                    </div>
                  )}
                  <span className={`badge position-absolute top-0 end-0 m-2 ${prod.stockDisponible > 0 ? 'bg-success' : 'bg-danger'}`}>
                    {prod.stockDisponible > 0 ? `Stock: ${prod.stockDisponible}` : 'Agotado'}
                  </span>
                </div>
                <div className="card-body">
                  <h5 className="card-title">{prod.nombre}</h5>
                  <p className="card-text text-muted small">{prod.descripcion}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="text-primary">{formatPrice(prod.precioUnitario)}</strong>
                    <div className="text-muted small">
                      <i className="fas fa-tag me-1"></i>{prod.categoriaNombre}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {showModal && selectedProducto && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">{selectedProducto.nombre}</h3>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {/* Columna izquierda: información */}
                  <div className="col-md-7">
                    <div className="mb-4">
                      <h5 className="text-muted">
                        <Link to={`/productos/por-categoria/${selectedProducto.categoriaId}`} className="text-decoration-none" onClick={(e) => e.stopPropagation()}>
                          <i className="fas fa-tag me-1"></i>{selectedProducto.categoriaNombre}
                        </Link>
                      </h5>
                      <div className="mb-3">
                        <Link to={`/productos/por-marca/${selectedProducto.marcaId}`} className="badge bg-secondary me-1 text-decoration-none" onClick={(e) => e.stopPropagation()}>
                          <i className="fas fa-industry me-1"></i>{selectedProducto.marcaNombre}
                        </Link>
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
                    </div>

                    <hr />

                    <div className="mb-4">
                      <h5>Descripción</h5>
                      <p className="text-justify">{selectedProducto.descripcion}</p>
                    </div>

                    <div className="mt-4">
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
                          <button
                            className="btn btn-primary"
                            onClick={() => {
                              addToCart(selectedProducto.id, modalCantidad);
                              alert('Producto agregado al carrito');
                              closeModal();
                            }}
                            title="Agregar al carrito"
                          >
                            <i className="fas fa-cart-plus"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Columna derecha: imagen */}
                  <div className="col-md-5 text-center">
                    {selectedProducto.fotoUrl ? (
                      <img
                        src={selectedProducto.fotoUrl}
                        className={`img-fluid rounded shadow mb-3 productImage`}
                        alt={selectedProducto.nombre}
                        style={{ maxHeight: '300px', width: 'auto', objectFit: 'contain' }}
                      />
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

export default ProductosList;