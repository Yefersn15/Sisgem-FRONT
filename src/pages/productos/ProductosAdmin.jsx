import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProductosAdmin } from './hooks/useProductosAdmin';
import ProductosAdminFiltros from './components/ProductosAdminFiltros';
import ProductoRow from './components/ProductoRow';
import Pagination from '../../components/Pagination';
import { useAyudaPagina } from '../../hooks/useAyudaPagina';

const ProductosAdmin = () => {
  useAyudaPagina({
    titulo: 'Productos',
    contenido: (
      <>
        <p>Gestiona el inventario: precio, stock, marca y categoría de cada producto.</p>
        <p>El botón de encendido activa o desactiva un producto sin eliminarlo — un producto inactivo no aparece en el catálogo público.</p>
      </>
    ),
  });
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
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2>Gestión de Productos</h2>
          <p className="text-muted mb-0">Administra el inventario de productos</p>
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

      <ProductosAdminFiltros
        marcas={marcas}
        categorias={categorias}
        filterMarca={filterMarca}
        setFilterMarca={setFilterMarca}
        filterCategoria={filterCategoria}
        setFilterCategoria={setFilterCategoria}
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
                    <ProductoRow
                      key={producto.id}
                      producto={producto}
                      onToggleActivo={toggleActivo}
                      onDelete={handleDelete}
                      onView={(id) => navigate(`/productos/${id}`)}
                      onEdit={(id) => navigate(`/productos/editar/${id}`)}
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

export default ProductosAdmin;
