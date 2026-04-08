import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import useDebounce from '../../hooks/useDebounce';
import { useCart } from '../../context/CartContext';
import { 
  getCatalogoByProveedor, 
  exportCatalogoProveedor, 
  importCatalogoProveedor, 
  getProductos, 
  getMarcaById, 
  getCategoriaById, 
  getProveedorById, 
  formatPrice,
  pedirMasStock,
  getMarcas,
  getCategorias
} from '../../services/dataService';

const CatalogoProveedorList = () => {
  const { id: proveedorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [proveedorNombre, setProveedorNombre] = useState('proveedor');
  const [baseItems, setBaseItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 350);
  const [availableMarcas, setAvailableMarcas] = useState([]);
  const [availableCategorias, setAvailableCategorias] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalCantidad, setModalCantidad] = useState(1);
  const [showPedirStockModal, setShowPedirStockModal] = useState(false);
  const [pedirStockProducto, setPedirStockProducto] = useState(null);
  const [pedirStockCantidad, setPedirStockCantidad] = useState(1);
  const { addToProviderCart } = useCart();
  const fileRef = useRef(null);
  const [importStatus, setImportStatus] = useState({});

  const reloadBase = async () => {
    const catalogo = await getCatalogoByProveedor(proveedorId) || [];
    const productos = await getProductos() || [];
    const marcas = await getMarcas() || [];
    const categorias = await getCategorias() || [];
    const proveedor = await getProveedorById(proveedorId).catch(() => null);
    setProveedorNombre((proveedor && proveedor.nombre) || 'proveedor');

    const marcaMap = (marcas || []).reduce((acc, m) => { acc[String(m.id)] = m; return acc; }, {});
    const catMap = (categorias || []).reduce((acc, c) => { acc[String(c.id)] = c; return acc; }, {});

    const productosMapped = (productos || []).filter(p => String(p.proveedorId) === String(proveedorId)).map(p => ({
      source: 'producto',
      refId: p.id,
      nombre: p.nombre,
      marcaNombre: (marcaMap[String(p.marcaId)] && marcaMap[String(p.marcaId)].nombre) || '',
      categoriaNombre: (catMap[String(p.categoriaId)] && catMap[String(p.categoriaId)].nombre) || '',
      precioSugerido: p.precioUnitario,
      adicional: p
    }));

    const catalogoMapped = (catalogo || []).map(it => ({
      source: 'catalogo',
      refId: it.id,
      nombre: it.nombre,
      marcaNombre: it.marcaNombre || '',
      categoriaNombre: it.categoriaNombre || '',
      precioSugerido: it.precioSugerido,
      adicional: it
    }));

    let list = [...catalogoMapped, ...productosMapped];

    // Calcular marcas y categorías disponibles
    const marcasSet = new Set();
    const categoriasSet = new Set();
    list.forEach(i => {
      if (i.marcaNombre) marcasSet.add(i.marcaNombre);
      if (i.categoriaNombre) categoriasSet.add(i.categoriaNombre);
    });
    setAvailableMarcas(Array.from(marcasSet));
    setAvailableCategorias(Array.from(categoriasSet));

    setBaseItems(list);
    setItems(list);
  };

  useEffect(() => { reloadBase(); }, [proveedorId]);

  const handleExport = () => exportCatalogoProveedor(proveedorId);

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importCatalogoProveedor(file, 
      async () => { 
        setImportStatus({ message: 'Importación exitosa', type: 'success' }); 
        await reloadBase();
        if (fileRef.current) fileRef.current.value = ''; 
        setTimeout(() => setImportStatus({}), 3000); 
      }, 
      (err) => { 
        setImportStatus({ message: 'Error importando', type: 'danger' }); 
        setTimeout(() => setImportStatus({}), 5000); 
      }
    );
  };

  // Aplicar filtros por query params: ?marca=... o ?categoria=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const marca = params.get('marca');
    const categoria = params.get('categoria');
    let list = Array.isArray(baseItems) ? [...baseItems] : [];
    if (marca) list = list.filter(i => String(i.marcaNombre || '').toLowerCase() === String(marca).toLowerCase());
    if (categoria) list = list.filter(i => String(i.categoriaNombre || '').toLowerCase() === String(categoria).toLowerCase());

    // Aplicar búsqueda debounced
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(i => (
        String(i.nombre || '').toLowerCase().includes(q) ||
        String(i.adicional?.descripcion || '').toLowerCase().includes(q) ||
        String(i.marcaNombre || '').toLowerCase().includes(q) ||
        String(i.categoriaNombre || '').toLowerCase().includes(q)
      ));
    }

    setItems(list);
  }, [location.search, proveedorId, debouncedSearch]);

  const openModal = (item) => {
    setSelectedProducto(item);
    setShowModal(true);
    setModalCantidad(1);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProducto(null);
  };

  const openPedirStockModal = (item) => {
    setPedirStockProducto(item);
    setShowPedirStockModal(true);
    setPedirStockCantidad(1);
  };

  const closePedirStockModal = () => {
    setShowPedirStockModal(false);
    setPedirStockProducto(null);
  };

  const handlePedirMasStock = async () => {
    if (!pedirStockProducto || pedirStockCantidad <= 0) return;
    try {
      await pedirMasStock(
        pedirStockProducto.refId,
        pedirStockCantidad,
        proveedorId,
        pedirStockProducto.precioSugerido,
        `Pedido de stock para ${pedirStockProducto.nombre}`
      );
      alert('Orden de compra creada para reabastecimiento');
      closePedirStockModal();
    } catch (err) {
      alert('Error al crear orden: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleAddToOrder = (refId, cantidad, source = 'producto') => {
    addToProviderCart(proveedorId, refId, cantidad, source);
    alert('Item agregado a la orden de compra');
    closeModal();
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Catálogo de {proveedorNombre || 'proveedor'}</h3>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={handleExport}>
            <i className="fas fa-file-export me-1"></i>Exportar
          </button>
          <input type="file" ref={fileRef} accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImport} />
          <button className="btn btn-outline-secondary me-2" onClick={() => fileRef.current && fileRef.current.click()}>
            <i className="fas fa-file-import me-1"></i>Importar
          </button>
          <button className="btn btn-primary me-2" onClick={() => navigate(`/proveedores/${proveedorId}/catalogo/nuevo`)}>
            <i className="fas fa-plus me-1"></i>Agregar Item
          </button>
          <button className="btn btn-primary" onClick={() => navigate(`/proveedores/${proveedorId}/orden`)}>
            <i className="fas fa-clipboard-list me-1"></i>Ver Orden
          </button>
        </div>
      </div>

      {/* Filtros */}
      <form className="row mb-3" onSubmit={(e) => e.preventDefault()}>
        <div className="col-md-3">
          <select 
            className="form-select" 
            value={new URLSearchParams(location.search).get('marca') || ''} 
            onChange={(e) => {
              const marca = e.target.value;
              const params = new URLSearchParams(location.search);
              if (marca) params.set('marca', marca); else params.delete('marca');
              navigate(`/proveedores/${proveedorId}/catalogo?` + params.toString());
            }}
          >
            <option value="">Todas las marcas</option>
            {availableMarcas.map(name => (<option key={name} value={name}>{name}</option>))}
          </select>
        </div>
        <div className="col-md-3">
          <select 
            className="form-select" 
            value={new URLSearchParams(location.search).get('categoria') || ''} 
            onChange={(e) => {
              const categoria = e.target.value;
              const params = new URLSearchParams(location.search);
              if (categoria) params.set('categoria', categoria); else params.delete('categoria');
              navigate(`/proveedores/${proveedorId}/catalogo?` + params.toString());
            }}
          >
            <option value="">Todas las categorías</option>
            {availableCategorias.map(name => (<option key={name} value={name}>{name}</option>))}
          </select>
        </div>
        <div className="col-md-4">
          <input 
            className="form-control" 
            placeholder="Buscar en catálogo..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
        <div className="col-md-2">
          <button 
            type="button" 
            className="btn btn-outline-secondary w-100" 
            onClick={() => { setSearchQuery(''); navigate(`/proveedores/${proveedorId}/catalogo`); }}
          >
            <i className="fas fa-times me-1"></i>Limpiar
          </button>
        </div>
      </form>

      {importStatus.message && (
        <div className={`alert alert-${importStatus.type} alert-dismissible`}>
          {importStatus.message}
          <button type="button" className="btn-close" onClick={() => setImportStatus({})}></button>
        </div>
      )}

      {/* Lista de productos */}
      {items.length === 0 ? (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          No hay items en el catálogo.
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {items.map(i => (
            <div key={`${i.source}-${i.refId}`} className="col">
              <div className="card h-100 shadow-sm producto-card" style={{ cursor: 'pointer' }} onClick={() => openModal(i)}>
                <div className="position-relative">
                  {i.adicional && i.adicional.fotoUrl ? (
                    <img src={i.adicional.fotoUrl} className="card-img-top" alt={i.nombre} style={{ height: '200px', objectFit: 'contain', backgroundColor: '#f8f9fa' }} />
                  ) : (
                    <div className="card-img-top d-flex align-items-center justify-content-center bg-light" style={{ height: '200px' }}>
                      <i className="fas fa-image fa-3x text-muted"></i>
                    </div>
                  )}
                  {i.source === 'producto' ? (
                    <span className={`badge position-absolute top-0 end-0 m-2 ${i.adicional.stockDisponible > 0 ? 'bg-success' : 'bg-danger'}`}>
                      {i.adicional.stockDisponible > 0 ? `Stock: ${i.adicional.stockDisponible}` : 'Agotado'}
                    </span>
                  ) : (
                    <span className={`badge position-absolute top-0 end-0 m-2 ${
                      i.adicional?.estadoStock === 'Disponible' ? 'bg-success' : 
                      i.adicional?.estadoStock === 'No Disponible' ? 'bg-danger' : 'bg-info'
                    }`}>
                      {i.adicional?.estadoStock || 'Desconocido'}
                    </span>
                  )}
                </div>
                <div className="card-body">
                  <h5 className="card-title">
                    {i.nombre} 
                    {i.source === 'producto' && <small className="text-success ms-2">(En tienda)</small>}
                  </h5>
                  <p className="card-text text-muted small">{i.adicional?.descripcion || ''}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="text-primary">{formatPrice(i.precioSugerido || 0)}</strong>
                  </div>
                  <div className="mt-2">
                    <button 
                      className="badge bg-secondary me-1 text-decoration-none" 
                      onClick={(e) => { e.stopPropagation(); navigate(`/proveedores/${proveedorId}/catalogo?categoria=${encodeURIComponent(i.categoriaNombre || '')}`); }}
                    >
                      {i.categoriaNombre}
                    </button>
                    <button 
                      className="badge bg-light text-dark me-1" 
                      onClick={(e) => { e.stopPropagation(); navigate(`/proveedores/${proveedorId}/catalogo?marca=${encodeURIComponent(i.marcaNombre || '')}`); }}
                    >
                      {i.marcaNombre}
                    </button>
                  </div>
                </div>
                <div className="card-footer bg-transparent border-0 d-flex justify-content-between">
                  {i.source === 'catalogo' ? (
                    <>
                      <button className="btn btn-sm btn-outline-primary" onClick={(e) => { e.stopPropagation(); navigate(`/catalogo/editar/${i.refId}`); }}>
                        <i className="fas fa-edit"></i> Editar
                      </button>
                      <button className="btn btn-sm btn-success" onClick={(e) => { e.stopPropagation(); addToProviderCart(proveedorId, i.refId, 1, 'catalogo'); alert('Agregado a orden'); }}>
                        <i className="fas fa-cart-plus"></i> Agregar
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-sm btn-outline-primary" onClick={(e) => { e.stopPropagation(); openModal(i); }}>
                        <i className="fas fa-eye"></i> Ver
                      </button>
                      <button className="btn btn-sm btn-warning" onClick={(e) => { e.stopPropagation(); openPedirStockModal(i); }}>
                        <i className="fas fa-plus"></i> Pedir Stock
                      </button>
                    </>
                  )}
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
                  <div className="col-md-7">
                    {(() => {
                      const detail = selectedProducto.source === 'producto' ? selectedProducto.adicional : (selectedProducto.catalogItem || selectedProducto.adicional || {});
                      return (
                        <>
                          <div className="mb-3">
                            <h5 className="text-muted">
                              <span className="me-2"><i className="fas fa-tag"></i></span>
                              {selectedProducto.categoriaNombre || 'Sin categoría'}
                            </h5>
                            <div className="mb-3">
                              <span className="badge bg-secondary me-1">{selectedProducto.marcaNombre || 'Sin marca'}</span>
                            </div>
                          </div>

                          <div className="mb-3">
                            <p><strong>Código Único:</strong> <span className="text-muted">{detail.codigoUnico || 'N/A'}</span></p>
                            <p><strong>Precio:</strong> <span className="text-primary h4">{formatPrice(detail.precioUnitario || detail.precioSugerido || 0)}</span></p>
                            
                            {selectedProducto.source === 'producto' ? (
                              <>
                                <p>
                                  <strong>Stock en Tienda:</strong>{' '}
                                  <span className={`badge ${(detail.stockDisponible || 0) > 0 ? 'bg-success' : 'bg-danger'}`}>
                                    {detail.stockDisponible || 0} unidades
                                  </span>
                                </p>
                                <p>
                                  <strong>Estado:</strong>{' '}
                                  <span className={`badge ${(detail.activo || detail.activo === undefined) ? 'bg-success' : 'bg-secondary'}`}>
                                    {(detail.activo || detail.activo === undefined) ? 'Activo' : 'Inactivo'}
                                  </span>
                                </p>
                              </>
                            ) : (
                              <>
                                <p>
                                  <strong>Estado stock:</strong>{' '}
                                  <span className={`badge ${
                                    (detail.estadoStock === 'Disponible') ? 'bg-success' : 
                                    (detail.estadoStock === 'No Disponible') ? 'bg-danger' : 'bg-warning'
                                  }`}>
                                    {detail.estadoStock || 'Desconocido'}
                                  </span>
                                </p>
                              </>
                            )}
                          </div>

                          <hr />
                          <div className="mb-4">
                            <h5>Descripción</h5>
                            <p className="text-justify">{detail.descripcion || 'Sin descripción'}</p>
                          </div>

                          <div className="mt-4 d-flex justify-content-between">
                            <div className="d-flex align-items-center">
                              {selectedProducto.source === 'producto' && detail.id && (
                                <button 
                                  className="btn btn-outline-primary me-2" 
                                  onClick={() => { closeModal(); navigate(`/productos/editar/${detail.id}`); }}
                                >
                                  <i className="fas fa-edit"></i> Editar producto
                                </button>
                              )}
                            </div>
                            <div className="d-flex align-items-center">
                              <input
                                type="number"
                                className="form-control me-2"
                                style={{ width: '80px' }}
                                min={1}
                                max={detail.stockDisponible || 999}
                                value={modalCantidad}
                                onChange={(e) => {
                                  const v = parseInt(e.target.value || '1', 10);
                                  setModalCantidad(Math.max(1, Math.min(detail.stockDisponible || 999, isNaN(v) ? 1 : v)));
                                }}
                              />
                              <button 
                                className="btn btn-outline-primary" 
                                onClick={() => handleAddToOrder(selectedProducto.refId || detail.id, modalCantidad, selectedProducto.source)}
                              >
                                <i className="fas fa-shopping-cart me-2"></i>
                                Agregar a Orden
                              </button>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="col-md-5 text-center">
                    {(() => {
                      const detail = selectedProducto.source === 'producto' ? selectedProducto.adicional : (selectedProducto.catalogItem || selectedProducto.adicional || {});
                      return detail.fotoUrl ? (
                        <img src={detail.fotoUrl} className="img-fluid rounded shadow mb-3" alt={detail.nombre || selectedProducto.nombre} style={{ maxHeight: '300px', width: 'auto', objectFit: 'contain' }} />
                      ) : (
                        <div className="text-muted d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                          <div>
                            <i className="fas fa-image fa-5x mb-3 d-block"></i>
                            <span>Sin imagen</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para pedir más stock */}
      {showPedirStockModal && pedirStockProducto && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Pedir más stock</h5>
                <button type="button" className="btn-close" onClick={closePedirStockModal}></button>
              </div>
              <div className="modal-body">
                <p><strong>Producto:</strong> {pedirStockProducto.nombre}</p>
                <p><strong>Proveedor:</strong> {proveedorNombre}</p>
                <div className="mb-3">
                  <label className="form-label">Cantidad a pedir:</label>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    value={pedirStockCantidad}
                    onChange={(e) => setPedirStockCantidad(Math.max(1, parseInt(e.target.value || '1', 10)))}
                  />
                </div>
                <p className="text-muted small">
                  Se creará una orden de compra pendiente que podrás confirmar después.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closePedirStockModal}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={handlePedirMasStock}>Crear Orden</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogoProveedorList;