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
    filtered,
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

      {filtered.length === 0 ? (
        <div className="alert alert-info">No hay registros de pagos pendientes o pagados.</div>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
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
                  {paginatedItems.map(venta => (
                    <PagoRow key={venta.id} venta={venta} onAbonar={handleAbonar} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagosAdmin;
