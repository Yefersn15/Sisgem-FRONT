import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../services/dataService';
import { useMisPedidos, getBadgeClass } from './hooks/useMisPedidos';

const MisPedidos = () => {
  const {
    user,
    search,
    setSearch,
    metodoFilter,
    setMetodoFilter,
    metodos,
    filtered,
    clearFilters,
    getEstadoEfectivo,
  } = useMisPedidos();

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">Debe iniciar sesión para ver sus pedidos.</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-body">
          <h2 className="card-title">Mis Pedidos</h2>

          <div className="row mb-3">
            <div className="col-md-5 mb-2">
              <input
                className="form-control"
                placeholder="Buscar por ID, dirección, teléfono, estado o método"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3 mb-2">
              <select className="form-select" value={metodoFilter} onChange={(e) => setMetodoFilter(e.target.value)}>
                <option value="">Filtrar por método</option>
                {metodos.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="col-md-1 mb-2 text-end">
              <button className="btn btn-secondary" onClick={clearFilters}>
                Limpiar
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="alert alert-info">No se encontraron pedidos con los filtros aplicados.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Método de Pago</th>
                    <th>Entrega</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((pedido) => {
                    const estadoEfectivo = getEstadoEfectivo(pedido);
                    const esVenta = pedido.es_venta;
                    const direccionEntrega = typeof pedido.direccion === 'object' ? pedido.direccion?.direccion : '';
                    return (
                      <tr key={pedido._id || pedido.id}>
                        <td>{pedido._id || pedido.id}</td>
                        <td>{new Date(pedido.fecha_pedido).toLocaleString()}</td>
                        <td>{formatPrice(pedido.total || 0)}</td>
                        <td>
                          <span className={`badge ${esVenta ? 'bg-success' : 'bg-secondary'}`}>
                            {esVenta ? 'Venta' : 'Pedido'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getBadgeClass(estadoEfectivo)}`}>
                            {estadoEfectivo}
                          </span>
                        </td>
                        <td>{pedido.metodo_pago}</td>
                        <td>
                          {pedido.tipo_venta === 'domicilio' ? (
                            <div>
                              <small><i className="fas fa-truck me-1"></i>{direccionEntrega}</small>
                            </div>
                          ) : (
                            <span className="text-muted">Tienda</span>
                          )}
                        </td>
                        <td>
                          <Link to={`/pedidos/${pedido._id || pedido.id}`} className="btn btn-sm btn-outline-primary" title="Ver detalle">
                            <i className="fas fa-eye"></i>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MisPedidos;
