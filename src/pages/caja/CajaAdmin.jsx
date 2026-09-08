// src/pages/caja/CajaAdmin.jsx
import { useState } from 'react';
import { formatPrice, formatDateForExport } from '../../services/api/utils';
import { useCaja } from './hooks/useCaja';
import Pagination from '../../components/Pagination';
import { useAyudaPagina } from '../../hooks/useAyudaPagina';

const DesglosePorMetodo = ({ titulo, resumen }) => {
  const metodos = Object.entries(resumen.porMetodo || {});
  if (metodos.length === 0) return null;
  return (
    <div className="mb-3">
      <h6 className="text-muted mb-2">{titulo} ({resumen.cantidad})</h6>
      <ul className="list-group list-group-flush">
        {metodos.map(([metodo, monto]) => (
          <li key={metodo} className="list-group-item d-flex justify-content-between px-0 py-1">
            <span>{metodo}</span>
            <span className="fw-bold">{formatPrice(monto)}</span>
          </li>
        ))}
        <li className="list-group-item d-flex justify-content-between px-0 py-1 border-top">
          <span>Total</span>
          <span className="fw-bold">{formatPrice(resumen.total)}</span>
        </li>
      </ul>
    </div>
  );
};

const CajaAdmin = () => {
  useAyudaPagina({
    titulo: 'Caja',
    contenido: (
      <>
        <p>Abre la caja al iniciar el turno con el dinero base que dejas en el cajón. Mientras esté abierta puedes ver en cualquier momento cuánto efectivo debería haber, sumando ese monto inicial a las ventas y abonos en efectivo registrados.</p>
        <p>Al cerrar, cuenta el efectivo físico e ingrésalo: el sistema te muestra la diferencia contra lo esperado. Esto es un resumen informativo, no bloquea ninguna venta si olvidas abrir la caja.</p>
      </>
    ),
  });
  const { actual, loading, procesando, error, abrir, cerrar, historialPaginado, currentPage, setCurrentPage, totalPages } = useCaja();
  const [montoInicial, setMontoInicial] = useState('');
  const [notasApertura, setNotasApertura] = useState('');
  const [montoContado, setMontoContado] = useState('');
  const [notasCierre, setNotasCierre] = useState('');

  const handleAbrir = async (e) => {
    e.preventDefault();
    const ok = await abrir(Number(montoInicial) || 0, notasApertura);
    if (ok) {
      setMontoInicial('');
      setNotasApertura('');
    }
  };

  const handleCerrar = async (e) => {
    e.preventDefault();
    if (!window.confirm('¿Cerrar la caja con este conteo? Esta acción no se puede deshacer.')) return;
    const ok = await cerrar(Number(montoContado) || 0, notasCierre);
    if (ok) {
      setMontoContado('');
      setNotasCierre('');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4 text-center">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2>Caja</h2>
        <p className="text-muted mb-0">Apertura, cierre y resumen de efectivo del turno</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {!actual ? (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">No hay ninguna caja abierta</h5>
            <p className="text-muted">Abre una caja indicando cuánto efectivo dejas de base en el cajón.</p>
            <form onSubmit={handleAbrir} className="row g-3 align-items-end">
              <div className="col-12 col-md-3">
                <label className="form-label">Monto inicial</label>
                <input type="number" min="0" step="any" className="form-control" value={montoInicial} onChange={(e) => setMontoInicial(e.target.value)} required />
              </div>
              <div className="col-12 col-md-5">
                <label className="form-label">Notas (opcional)</label>
                <input className="form-control" value={notasApertura} onChange={(e) => setNotasApertura(e.target.value)} />
              </div>
              <div className="col-12 col-md-auto">
                <button type="submit" className="btn btn-primary" disabled={procesando}>
                  {procesando ? 'Abriendo...' : 'Abrir caja'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span className="fw-bold">Caja abierta</span>
                <span className="badge bg-success">Abierta</span>
              </div>
              <div className="card-body">
                <p className="mb-1"><strong>Abierta por:</strong> {actual.sesion.abiertoPorNombre || actual.sesion.abiertoPorDocumento}</p>
                <p className="mb-1"><strong>Desde:</strong> {formatDateForExport(actual.sesion.createdAt)}</p>
                <p className="mb-3"><strong>Monto inicial:</strong> {formatPrice(actual.sesion.montoInicial)}</p>

                <DesglosePorMetodo titulo="Ventas de contado" resumen={actual.resumen.ventas} />
                <DesglosePorMetodo titulo="Abonos aplicados" resumen={actual.resumen.abonos} />

                {actual.resumen.domicilios.cantidad > 0 && (
                  <p className="mb-3">
                    <strong>Domicilios entregados:</strong> {actual.resumen.domicilios.cantidad} (envíos por {formatPrice(actual.resumen.domicilios.totalTarifas)})
                  </p>
                )}

                <div className="alert alert-info d-flex justify-content-between align-items-center mb-0">
                  <span>Efectivo esperado en caja</span>
                  <span className="fw-bold fs-5">{formatPrice(actual.resumen.efectivoEsperado)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-header fw-bold">Cerrar caja</div>
              <div className="card-body">
                <form onSubmit={handleCerrar}>
                  <div className="mb-3">
                    <label className="form-label">Efectivo contado físicamente</label>
                    <input type="number" min="0" step="any" className="form-control" value={montoContado} onChange={(e) => setMontoContado(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notas (opcional)</label>
                    <textarea className="form-control" rows={2} value={notasCierre} onChange={(e) => setNotasCierre(e.target.value)} />
                  </div>
                  <button type="submit" className="btn btn-danger" disabled={procesando}>
                    {procesando ? 'Cerrando...' : 'Cerrar caja'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card mt-4">
        <div className="card-header fw-bold">Historial de cajas</div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Abierta por</th>
                <th>Apertura</th>
                <th>Cierre</th>
                <th>Monto inicial</th>
                <th>Contado</th>
                <th>Esperado</th>
                <th>Diferencia</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {historialPaginado.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">No hay cajas registradas todavía</td>
                </tr>
              ) : (
                historialPaginado.map((sesion) => {
                  const diferencia = sesion.resumenCierre?.diferencia;
                  return (
                    <tr key={sesion.id}>
                      <td>{sesion.abiertoPorNombre || sesion.abiertoPorDocumento}</td>
                      <td>{formatDateForExport(sesion.createdAt)}</td>
                      <td>{sesion.fechaCierre ? formatDateForExport(sesion.fechaCierre) : '—'}</td>
                      <td>{formatPrice(sesion.montoInicial)}</td>
                      <td>{sesion.montoContado != null ? formatPrice(sesion.montoContado) : '—'}</td>
                      <td>{sesion.resumenCierre?.efectivoEsperado != null ? formatPrice(sesion.resumenCierre.efectivoEsperado) : '—'}</td>
                      <td>
                        {diferencia != null ? (
                          <span className={`fw-bold ${diferencia < 0 ? 'text-danger' : diferencia > 0 ? 'text-warning' : 'text-success'}`}>
                            {formatPrice(diferencia)}
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        <span className={`badge ${sesion.estado === 'abierta' ? 'bg-success' : 'bg-secondary'}`}>
                          {sesion.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="card-body">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  );
};

export default CajaAdmin;
