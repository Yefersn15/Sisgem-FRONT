import { usePagosAdmin } from './hooks/usePagosAdmin';
import PagosAdminFiltros from './components/PagosAdminFiltros';
import PagoRow from './components/PagoRow';
import Pagination from '../../components/Pagination';
import { useAyudaPagina } from '../../hooks/useAyudaPagina';

const PagosAdmin = () => {
  useAyudaPagina({
    titulo: 'Pagos y abonos',
    contenido: <p>Registra abonos parciales sobre ventas y controla el saldo pendiente de cada una. Una venta pagada por completo deja de aparecer aquí.</p>,
  });
  const {
    search,
    setSearch,
    filterEstadoPago,
    setFilterEstadoPago,
    clearFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    importStatus,
    fileInputRef,
    paginatedItems,
    handleExport,
    handleImport,
    handleAbonar,
  } = usePagosAdmin();

  const onImportChange = (e) => {
    const file = e.target.files[0];
    handleImport(file);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2>Gestión de Pagos / Abonos</h2>
          <p className="text-muted mb-0">Administra los pagos y abonos de las ventas</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-secondary" onClick={handleExport}>
            <i className="fas fa-file-export me-1"></i>Exportar
          </button>
          <input type="file" ref={fileInputRef} accept=".xlsx,.xls" style={{ display: 'none' }} onChange={onImportChange} />
          <button className="btn btn-outline-secondary" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
            <i className="fas fa-file-import me-1"></i>Importar
          </button>
        </div>
      </div>

      {importStatus.message && (
        <div className={`alert alert-${importStatus.type}`}>{importStatus.message}</div>
      )}

      <PagosAdminFiltros
        search={search}
        setSearch={setSearch}
        filterEstadoPago={filterEstadoPago}
        setFilterEstadoPago={setFilterEstadoPago}
        clearFilters={clearFilters}
      />

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID Venta</th>
                  <th>Usuario</th>
                  <th>Fecha</th>
                  <th>Saldo Pendiente</th>
                  <th>Método de Pago</th>
                  <th>Estado Pago</th>
                  <th>Tipo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      No hay registros de pagos pendientes o pagados
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map(venta => (
                    <PagoRow key={venta.id} venta={venta} onAbonar={handleAbonar} />
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

export default PagosAdmin;
