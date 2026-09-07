import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMarcasAdmin } from './hooks/useMarcasAdmin';
import MarcasAdminFiltros from './components/MarcasAdminFiltros';
import MarcaRow from './components/MarcaRow';
import Pagination from '../../components/Pagination';
import { useAyudaPagina } from '../../hooks/useAyudaPagina';

const MarcasAdmin = () => {
  useAyudaPagina({
    titulo: 'Marcas',
    contenido: <p>Gestiona las marcas del catálogo. Una marca con productos asociados <strong>no se puede eliminar</strong>; solo se puede desactivar.</p>,
  });
  const navigate = useNavigate();
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
  } = useMarcasAdmin();
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
          <h2>Gestión de Marcas</h2>
          <p className="text-muted mb-0">Administra las marcas de productos</p>
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
          <Link to="/marcas/nueva" className="btn btn-primary">
            <i className="fas fa-plus me-1"></i>Nueva Marca
          </Link>
        </div>
      </div>

      {importStatus.message && (
        <div className={`alert alert-${importStatus.type} alert-dismissible fade show`} role="alert">
          {importStatus.message}
          <button type="button" className="btn-close" onClick={() => setImportStatus({ message: '', type: '' })}></button>
        </div>
      )}

      <MarcasAdminFiltros
        filterEstado={filterEstado}
        setFilterEstado={setFilterEstado}
        sortBy={sortBy}
        setSortBy={setSortBy}
        query={query}
        setQuery={setQuery}
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
                      No hay marcas que mostrar
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map(marca => (
                    <MarcaRow
                      key={marca.id}
                      marca={marca}
                      onToggleActiva={toggleActiva}
                      onDelete={handleDelete}
                      onView={(id) => navigate(`/marcas/${id}`)}
                    />
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

export default MarcasAdmin;
