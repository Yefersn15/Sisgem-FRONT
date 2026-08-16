// src/pages/pagos/MisPagos.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../services/dataService';
import { useMisPagos, getMetodoBadge, getEstadoBadge } from './hooks/useMisPagos';

const MisPagos = () => {
  const { user, search, setSearch, filterEstadoPago, setFilterEstadoPago, clearFilters, filtered } = useMisPagos();

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">Debe iniciar sesión para ver sus pagos.</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-body">
          <h2 className="card-title">Mis Pedidos y Pagos</h2>

          <div className="row mb-3 align-items-center">
            <div className="col-md-5 mb-2">
              <input
                className="form-control"
                placeholder="Buscar por ID o método de pago"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3 mb-2">
              <select className="form-select" value={filterEstadoPago} onChange={(e) => setFilterEstadoPago(e.target.value)}>
                <option value="Todos">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Pagado">Pagado</option>
              </select>
            </div>
            <div className="col-md-4 mb-2 text-end">
              <button className="btn btn-secondary" onClick={clearFilters}>
                Limpiar
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="alert alert-info">No tienes pedidos registrados.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Saldo Pendiente</th>
                    <th>Método de Pago</th>
                    <th>Estado</th>
                    <th>Tipo Entrega</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(venta => (
                    <tr key={venta.id}>
                      <td>#{venta.id}</td>
                      <td>{venta.fecha ? new Date(venta.fecha).toLocaleDateString() : 'N/A'}</td>
                      <td className="fw-bold">{formatPrice(venta.totalVenta)}</td>
                      <td className={`fw-bold ${venta.saldoPendiente > 0 ? 'text-danger' : 'text-success'}`}>
                        {venta.esAbono ? formatPrice(venta.saldoPendiente) : '-'}
                      </td>
                      <td>
                        <span className={`badge ${getMetodoBadge(venta.metodoPago)}`}>
                          {venta.metodoPago}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getEstadoBadge(venta.estadoPago, venta.esVenta, venta.esAbono)}`}>
                          {venta.esVenta && !venta.esAbono ? 'Completado' : venta.estadoPago}
                        </span>
                      </td>
                      <td>
                        {venta.tipo_venta === 'domicilio' || venta.delivery ? (
                          <span className="badge bg-info">Domicilio</span>
                        ) : (
                          <span className="text-muted">Tienda</span>
                        )}
                      </td>
                      <td>
                        <Link to={`/pedidos/${venta.id}`} className="btn btn-sm btn-outline-info">
                          Ver Detalle
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MisPagos;
