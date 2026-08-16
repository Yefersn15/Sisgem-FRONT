// src/pages/ventas/components/PagosAbono.jsx
import React from 'react';
import { formatPrice } from '../../../services/dataService';
import { formatFecha } from '../hooks/ventaFormatters';
import { getEstadoBadge } from '../hooks/useVentaDetalle';

const PagosAbono = ({ totalConEnvio, totalPagado, pagos, canConfirmPayment, onCambiarEstadoPago }) => {
  const saldo = Math.max(0, totalConEnvio - totalPagado);

  return (
    <div className="row mb-4">
      <div className="col-md-6">
        <div className="card h-100">
          <div className="card-header"><h6 className="mb-0"><i className="fas fa-hand-holding-usd me-2"></i>Abonos</h6></div>
          <div className="card-body">
            <p className="mb-1"><strong>Total:</strong> {formatPrice(totalConEnvio)}</p>
            <p className="mb-1"><strong>Pagado:</strong> {formatPrice(totalPagado)}</p>
            <p className="mb-0"><strong>Saldo:</strong> <span className={saldo > 0 ? 'text-danger' : 'text-success'}>{formatPrice(saldo)}</span></p>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card h-100">
          <div className="card-header">
            <h6 className="mb-0"><i className="fas fa-money-bill-wave me-2"></i>Pagos</h6>
          </div>
          <div className="card-body p-0" style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {pagos.length > 0 ? (
              <table className="table table-sm table-hover mb-0">
                <thead className="table-light sticky-top">
                  <tr>
                    <th>Fecha</th>
                    <th>Método</th>
                    <th className="text-end">Monto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map((pago) => (
                    <tr key={pago.id}>
                      <td>{formatFecha(pago.fecha)}</td>
                      <td>{pago.metodo}</td>
                      <td className="text-end">{formatPrice(pago.monto)}</td>
                      <td>
                        {canConfirmPayment && String(pago.estado).toLowerCase() === 'pendiente' ? (
                          <select
                            className={`form-select form-select-sm ${getEstadoBadge(pago.estado)}`}
                            value={pago.estado}
                            onChange={(e) => onCambiarEstadoPago(pago.id, e.target.value)}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="aplicado">Aplicado</option>
                            <option value="rechazado">Rechazado</option>
                          </select>
                        ) : (
                          <span className={`badge ${getEstadoBadge(pago.estado)}`}>
                            {pago.estado}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center text-muted p-3">No hay pagos registrados</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagosAbono;
