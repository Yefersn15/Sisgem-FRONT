import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProductos, getMarcas, getCategorias, deleteProducto, updateProducto, formatPrice, exportProductos, importProductos } from '../../services/dataService';
import useDebounce from '../../hooks/useDebounce';

const AdminProductos = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filterMarca, setFilterMarca] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [sortBy, setSortBy] = useState('nombre-asc');
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState({ message: '', type: '' });

  const handleExport = () => {
    exportProductos();
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    importProductos(file, 
      (count) => {
        setImportStatus({ message: `${count} productos importados exitosamente`, type: 'success' });
        cargarProductos();
        setTimeout(() => setImportStatus({ message: '', type: '' }), 3000);
      },
      (error) => {
        setImportStatus({ message: error.message || 'Error al importar', type: 'danger' });
        setTimeout(() => setImportStatus({ message: '', type: '' }), 5000);
      }
    );
    e.target.value = '';
  };

  useEffect(() => {
    const init = async () => {
      let mar = await getMarcas() || [];
      let cat = await getCategorias() || [];
      // Extraer datos de la respuesta API { success, data }
      if (!Array.isArray(mar)) {
        mar = mar.data ? mar.data : (mar || []);
      }
      if (!Array.isArray(cat)) {
        cat = cat.data ? cat.data : (cat || []);
      }
      setMarcas(mar);
      setCategorias(cat);
      await cargarProductos(mar, cat);
    };
    init();
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [debounced, filterMarca, filterCategoria, filterEstado, sortBy]);

  const cargarProductos = async (marcasLocal, categoriasLocal) => {
    let lista = await getProductos();
    lista = lista || [];
    // Extraer datos de la respuesta API { success, data }
    if (!Array.isArray(lista)) {
      lista = lista.data ? lista.data : (lista || []);
    }

    const marcasLocalVar = marcasLocal || await getMarcas() || [];
    const categoriasLocalVar = categoriasLocal || await getCategorias() || [];

    // Enriquecer con nombres
    lista = lista.map(p => ({
      ...p,
      marcaNombre: (marcasLocalVar.find(m => String(m.id) === String(p.marcaId)) || {}).nombre || 'Sin marca',
      categoriaNombre: (categoriasLocalVar.find(c => String(c.id) === String(p.categoriaId)) || {}).nombre || 'Sin categoría'
    }));

    if (filterMarca) {
      lista = lista.filter(p => String(p.marcaId) === String(filterMarca));
    }
    
    if (filterCategoria) {
      lista = lista.filter(p => String(p.categoriaId) === String(filterCategoria));
    }

    if (filterEstado) {
      if (filterEstado === 'activo') {
        lista = lista.filter(p => p.activo !== false);
      } else if (filterEstado === 'inactivo') {
        lista = lista.filter(p => p.activo === false);
      }
    }

    if (debounced) {
      const q = debounced.toLowerCase();
      lista = lista.filter(p => 
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion?.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      );
    }

    // Ordenar según sortBy
    lista = [...lista].sort((a, b) => {
      switch (sortBy) {
        case 'nombre-asc':
          return (a.nombre || '').localeCompare(b.nombre || '');
        case 'nombre-desc':
          return (b.nombre || '').localeCompare(a.nombre || '');
        case 'id-asc':
          return (a.id || 0) - (b.id || 0);
        case 'id-desc':
          return (b.id || 0) - (a.id || 0);
        case 'stock-asc':
          return (parseInt(a.stockDisponible) || 0) - (parseInt(b.stockDisponible) || 0);
        case 'stock-desc':
          return (parseInt(b.stockDisponible) || 0) - (parseInt(a.stockDisponible) || 0);
        case 'precio-asc':
          return (parseFloat(a.precioUnitario) || 0) - (parseFloat(b.precioUnitario) || 0);
        case 'precio-desc':
          return (parseFloat(b.precioUnitario) || 0) - (parseFloat(a.precioUnitario) || 0);
        default:
          return (a.nombre || '').localeCompare(b.nombre || '');
      }
    });

    setProductos(lista);
    setCurrentPage(1);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      (async () => {
        await deleteProducto(id);
        await cargarProductos();
      })();
    }
  };

  const toggleActivo = (producto) => {
    (async () => {
      await updateProducto(producto.id, { ...producto, activo: !producto.activo });
      await cargarProductos();
    })();
  };

  // Stats
  const totalProductos = productos.length;
  const productosActivos = productos.filter(p => p.activo !== false).length;
  const productosInactivos = productos.filter(p => p.activo === false).length;
  const totalStock = productos.reduce((sum, p) => sum + (parseInt(p.stockDisponible) || 0), 0);
  const totalValor = productos.reduce((sum, p) => sum + ((parseFloat(p.precioUnitario) || 0) * (parseInt(p.stockDisponible) || 0)), 0);

  // Paginación
  const totalPages = Math.ceil(productos.length / itemsPerPage);
  const paginatedItems = productos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Gestión de Productos</h2>
          <p className="text-muted mb-0">Administra el inventario de productos</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={handleExport}>
            <i className="fas fa-file-export me-1"></i>Exportar
          </button>
          <button className="btn btn-outline-secondary" onClick={() => fileInputRef.current?.click()}>
            <i className="fas fa-file-import me-1"></i>Importar
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
          />
          <Link to="/productos/nuevo" className="btn btn-primary">
            <i className="fas fa-plus me-1"></i>Nuevo Producto
          </Link>
        </div>
      </div>

      {/* Import status alert */}
      {importStatus.message && (
        <div className={`alert alert-${importStatus.type} alert-dismissible fade show`} role="alert">
          {importStatus.message}
          <button type="button" className="btn-close" onClick={() => setImportStatus({ message: '', type: '' })}></button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 opacity-75">Total Productos</p>
                  <h3 className="mb-0">{totalProductos}</h3>
                </div>
                <i className="fas fa-boxes fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 opacity-75">Productos Activos</p>
                  <h3 className="mb-0">{productosActivos}</h3>
                </div>
                <i className="fas fa-check-circle fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 opacity-75">Stock Total</p>
                  <h3 className="mb-0">{totalStock}</h3>
                </div>
                <i className="fas fa-box fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 opacity-75">Valor Inventario</p>
                  <h3 className="mb-0">{formatPrice(totalValor)}</h3>
                </div>
                <i className="fas fa-dollar-sign fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-2">
              <select 
                className="form-select" 
                value={filterMarca} 
                onChange={(e) => setFilterMarca(e.target.value)}
              >
                <option value="">Todas las marcas</option>
                {marcas.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select 
                className="form-select" 
                value={filterCategoria} 
                onChange={(e) => setFilterCategoria(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select 
                className="form-select" 
                value={filterEstado} 
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>
            <div className="col-md-2">
              <select 
                className="form-select" 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="nombre-asc">Nombre (A-Z)</option>
                <option value="nombre-desc">Nombre (Z-A)</option>
                <option value="id-asc">ID (menor a mayor)</option>
                <option value="id-desc">ID (mayor a menor)</option>
                <option value="stock-asc">Stock (menos a más)</option>
                <option value="stock-desc">Stock (más a menos)</option>
                <option value="precio-asc">Precio (menor a mayor)</option>
                <option value="precio-desc">Precio (mayor a menor)</option>
              </select>
            </div>
            <div className="col-md-2">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre, descripción o ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => { setQuery(''); setFilterMarca(''); setFilterCategoria(''); setFilterEstado(''); setSortBy('nombre-asc'); }}
              >
                <i className="fas fa-times me-1"></i>Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Marca</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      No hay productos que mostrar
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map(producto => (
                    <tr key={producto.id}>
                      <td><small className="text-muted">{producto.id}</small></td>
                      <td className="fw-medium">{producto.nombre}</td>
                      <td>{producto.marcaNombre}</td>
                      <td>{producto.categoriaNombre}</td>
                      <td>{formatPrice(producto.precioUnitario)}</td>
                      <td>
                        <span className={`badge ${(parseInt(producto.stockDisponible) || 0) > 0 ? 'bg-success' : 'bg-danger'}`}>
                          {producto.stockDisponible || 0}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`btn btn-sm ${producto.activo !== false ? 'btn-success' : 'btn-secondary'}`}
                          onClick={() => toggleActivo(producto)}
                        >
                          {producto.activo !== false ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => navigate(`/productos/editar/${producto.id}`)}
                            title="Editar"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(producto.id)}
                            title="Eliminar"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <nav className="mt-3">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => p - 1)}>Anterior</button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => p + 1)}>Siguiente</button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductos;