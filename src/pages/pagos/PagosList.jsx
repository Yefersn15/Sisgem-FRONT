import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../services/dataService';
import { usePagosAdmin } from './hooks/usePagosAdmin';

const PagosList = () => {
  const {
    search,
    setSearch,
    filterEstadoPago,
    setFilterEstadoPago,
    clearFilters,
    importStatus,
    fileInputRef,
    filtered,
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Gestión de Pagos / Abonos</h2>
          <p className="text-muted mb-0">Administra los pagos y abonos de las ventas</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={handleExport}>
            <i className="fas fa-file-export me-1"></i>Exportar
          </button>
          <input type="file" ref={fileInputRef} accept=".xlsx,.xls" style={{ display: 'none' }} onChange={onImportChange} />
          <button className="btn btn-outline-primary" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
            <i className="fas fa-file-import me-1"></i>Importar
          </button>
        </div>
      </div>

      {importStatus.message && (
        <div className={`alert alert-${importStatus.type}`}>{importStatus.message}</div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-5">
              <input
                className="form-control"
                placeholder="Buscar por ID, usuario o método de pago"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select className="form-select" value={filterEstadoPago} onChange={(e) => setFilterEstadoPago(e.target.value)}>
                <option value="Todos">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Pagado">Pagado</option>
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-secondary w-100" onClick={clearFilters}>
                <i className="fas fa-eraser me-1"></i>Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

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
                  {filtered.map(venta => (
                    <tr key={venta.id}>
                      <td>#{venta.id}</td>
                      <td>{venta.usuarioNombre || 'Usuario no registrado'}</td>
                      <td>{venta.fecha ? new Date(venta.fecha).toLocaleString() : 'N/A'}</td>
                      <td className="fw-bold">{formatPrice(venta.saldoPendiente)}</td>
                      <td>{venta.metodoPago}</td>
                      <td>
                        <span className={`badge ${venta.estadoPago === 'Pagado' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {venta.estadoPago}
                        </span>
                      </td>
                      <td>
                        {venta.tipo_venta === 'domicilio' ? (
                          <span className="badge bg-info">Domicilio</span>
                        ) : (
                          <span className="text-muted">Tienda</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Link to={`/admin/pagos/${venta.id}`} className="btn btn-sm btn-outline-info" title="Ver detalle">
                            <i className="fas fa-eye"></i>
                          </Link>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleAbonar(venta)}
                            title="Abonar"
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagosList;
