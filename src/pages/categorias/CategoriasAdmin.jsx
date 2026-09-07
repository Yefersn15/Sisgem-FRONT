import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCategoriasAdmin } from './hooks/useCategoriasAdmin';
import CategoriasAdminFiltros from './components/CategoriasAdminFiltros';
import CategoriaRow from './components/CategoriaRow';
import Pagination from '../../components/Pagination';
import { useAyudaPagina } from '../../hooks/useAyudaPagina';

const CategoriasAdmin = () => {
  useAyudaPagina({
    titulo: 'Categorías',
    contenido: <p>Gestiona las categorías del catálogo. Una categoría con productos asociados <strong>no se puede eliminar</strong>; solo se puede desactivar.</p>,
  });
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
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2>Gestión de Categorías</h2>
          <p className="text-muted mb-0">Administra las categorías de productos</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
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

      <CategoriasAdminFiltros
        query={query}
        setQuery={setQuery}
        filterEstado={filterEstado}
        setFilterEstado={setFilterEstado}
        sortBy={sortBy}
        setSortBy={setSortBy}
        clearFilters={clearFilters}
      />

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
                    <CategoriaRow key={categoria.id} categoria={categoria} onToggleActiva={toggleActiva} onDelete={handleDelete} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  );
};

export default CategoriasAdmin;
