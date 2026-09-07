import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../services/api/utils';
import { useMisPedidos, getBadgeClass } from './hooks/useMisPedidos';
import FiltrosBar from '../../components/FiltrosBar';
import Pagination from '../../components/Pagination';
import { useAyudaPagina } from '../../hooks/useAyudaPagina';

const MisPedidos = () => {
  useAyudaPagina({
    titulo: 'Mis Pedidos',
    contenido: <p>Aquí aparecen todos tus pedidos y ventas de mostrador. Usa el buscador o los filtros de estado/método de pago para encontrar uno, y el ícono de ojo para ver su detalle completo.</p>,
  });
  const {
    user,
    search,
    setSearch,
    estadoFilter,
    setEstadoFilter,
    metodoFilter,
    setMetodoFilter,
    estados,
    metodos,
    paginatedItems,
    currentPage,
    setCurrentPage,
    totalPages,
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

          <FiltrosBar onClear={clearFilters}>
            <div className="col-12 col-md-4">
              <input
                className="form-control"
                placeholder="Buscar por ID, dirección, teléfono, estado o método..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-6 col-md">
              <select className="form-select" value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}>
                <option value="">Todos los estados</option>
                {estados.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md">
              <select className="form-select" value={metodoFilter} onChange={(e) => setMetodoFilter(e.target.value)}>
                <option value="">Todos los métodos</option>
                {metodos.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </FiltrosBar>

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
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      No se encontraron pedidos con los filtros aplicados
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((pedido) => {
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
                          <Link to={`/pedidos/${pedido._id || pedido.id}`} className="btn btn-sm btn-outline-info" title="Ver detalle">
                            <i className="fas fa-eye"></i>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
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

export default MisPedidos;
