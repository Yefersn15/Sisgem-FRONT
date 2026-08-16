import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../services/dataService';
import { useProductosAdmin } from './hooks/useProductosAdmin';

const AdminProductos = () => {
  const navigate = useNavigate();
  const {
    marcas,
    categorias,
    paginatedItems,
    currentPage,
    setCurrentPage,
    totalPages,
    query,
    setQuery,
    filterMarca,
    setFilterMarca,
    filterCategoria,
    setFilterCategoria,
    filterEstado,
    setFilterEstado,
    sortBy,
    setSortBy,
    clearFilters,
    importStatus,
    setImportStatus,
    handleDelete,
    toggleActivo,
    handleExport,
    handleImport,
  } = useProductosAdmin();
  const fileInputRef = useRef(null);

  const onImportChange = (e) => {
    const file = e.target.files?.[0];
    handleImport(file);
    e.target.value = '';
  };

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
            onChange={onImportChange}
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
          />
          <Link to="/productos/nuevo" className="btn btn-primary">
            <i className="fas fa-plus me-1"></i>Nuevo Producto
          </Link>
        </div>
      </div>

      {importStatus.message && (
        <div className={`alert alert-${importStatus.type} alert-dismissible fade show`} role="alert">
          {importStatus.message}
          <button type="button" className="btn-close" onClick={() => setImportStatus({ message: '', type: '' })}></button>
        </div>
      )}

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

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
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
                    <td colSpan="7" className="text-center text-muted py-4">
                      No hay productos que mostrar
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map(producto => (
                    <tr key={producto.id}>
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
                          className={`btn btn-sm ${producto.activo !== false ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => toggleActivo(producto)}
                          title={producto.activo !== false ? 'Desactivar' : 'Activar'}
                        >
                          <i className={`fas fa-toggle-${producto.activo !== false ? 'off' : 'on'}`}></i>
                        </button>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-outline-info btn-sm"
                            onClick={() => navigate(`/productos/${producto.id}`)}
                            title="Ver detalle"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => navigate(`/productos/editar/${producto.id}`)}
                            title="Editar"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
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
