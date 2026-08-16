import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCategoriasAdmin } from './hooks/useCategoriasAdmin';

const AdminCategorias = () => {
  const {
    paginatedItems,
    currentPage,
    setCurrentPage,
    totalPages,
    query,
    setQuery,
    filterEstado,
    setFilterEstado,
    sortBy,
    setSortBy,
    clearFilters,
    importStatus,
    setImportStatus,
    handleDelete,
    toggleActiva,
    handleExport,
    handleImport,
  } = useCategoriasAdmin();
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
          <h2>Gestión de Categorías</h2>
          <p className="text-muted mb-0">Administra las categorías de productos</p>
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
          <Link to="/categorias/nueva" className="btn btn-primary">
            <i className="fas fa-plus me-1"></i>Nueva Categoría
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
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre, descripción o ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="activa">Activas</option>
                <option value="inactiva">Inactivas</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="nombre-asc">Nombre (A-Z)</option>
                <option value="nombre-desc">Nombre (Z-A)</option>
                <option value="id-asc">ID (menor a mayor)</option>
                <option value="id-desc">ID (mayor a menor)</option>
                <option value="productos-asc">Productos (menos a más)</option>
                <option value="productos-desc">Productos (más a menos)</option>
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

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Productos</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No hay categorías que mostrar
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map(categoria => (
                    <tr key={categoria.id}>
                      <td className="fw-medium">{categoria.nombre}</td>
                      <td><small>{categoria.descripcion || '-'}</small></td>
                      <td>
                        <span className="badge bg-secondary">{categoria.productoCount}</span>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${categoria.activa ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => toggleActiva(categoria)}
                          title={categoria.activa ? 'Desactivar' : 'Activar'}
                        >
                          <i className={`fas fa-toggle-${categoria.activa ? 'off' : 'on'}`}></i>
                        </button>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Link to={`/categorias/editar/${categoria.id}`} className="btn btn-outline-primary btn-sm" title="Editar">
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(categoria.id)}
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

export default AdminCategorias;
