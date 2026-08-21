import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../services/api/utils';
import { usePedidosAdmin } from './hooks/usePedidosAdmin';
import { usePedidoBuilder } from './hooks/usePedidoBuilder';
import CrearPedidoModal from './components/CrearPedidoModal';

const PedidosAdmin = () => {
  const navigate = useNavigate();
  const {
    usuarios,
    productos,
    filterEstado,
    setFilterEstado,
    filterMetodo,
    setFilterMetodo,
    busqueda,
    setBusqueda,
    clearFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    currentItems,
    cargarPedidos,
    handleAprobarSolicitudAbono,
    handleRechazarAbono,
  } = usePedidosAdmin();

  const {
    modal,
    setModal,
    form,
    setForm,
    item,
    setItem,
    seleccionarUsuario,
    setSeleccionarUsuario,
    handleCreate,
    handleSelectProducto,
    addItem,
    removeItem,
    totalForm,
    guardarPedido,
  } = usePedidoBuilder(productos, cargarPedidos);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Gestión de Pedidos</h2>
          <p className="text-muted mb-0">Administra los pedidos de los clientes</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          <i className="fas fa-plus me-1"></i>Nuevo Pedido
        </button>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Buscar por ID o usuario"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterEstado}
                onChange={e => setFilterEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="aprobado">Aprobado</option>
                <option value="enviado">Enviado</option>
                <option value="recibido">Recibido</option>
                <option value="cancelado">Cancelado</option>
                <option value="anulado">Anulado</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterMetodo}
                onChange={e => setFilterMetodo(e.target.value)}
              >
                <option value="">Todos los métodos</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Abono">Abono</option>
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-secondary w-100" onClick={clearFilters}>
                <i className="fas fa-eraser me-1"></i>Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th className="text-end">Total</th>
                  <th>Estado</th>
                  <th>Método</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(pedido => (
                  <tr key={pedido.id}>
                    <td>{pedido.tipo_venta === 'domicilio' ? 'Domicilio' : 'Mostrador'}</td>
                    <td>{new Date(pedido.fecha).toLocaleString()}</td>
                    <td>{pedido.usuarioNombre || 'Usuario'}</td>
                    <td className="text-end fw-medium">{formatPrice(pedido.total)}</td>
                    <td>
                      {pedido.metodoPago === 'Abono' && pedido.estadoPedido === 'pendiente' ? (
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-success" onClick={() => handleAprobarSolicitudAbono(pedido.id, pedido.metodoPago)} title="Aprobar abono">
                            <i className="fas fa-check"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleRechazarAbono(pedido.id)} title="Rechazar abono">
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : (
                        <span className={`badge ${
                          pedido.estadoPedido === 'entregado' ? 'bg-success' :
                          pedido.estadoPedido === 'cancelado' ? 'bg-danger' :
                          pedido.estadoPedido === 'en_camino' ? 'bg-info' :
                          pedido.estadoPedido === 'asignado' || pedido.estadoPedido === 'en_preparacion' ? 'bg-warning' :
                          pedido.estadoPedido === 'aprobado' ? 'bg-primary' : 'bg-secondary'
                        }`}>
                          {pedido.estadoPedido === 'en_preparacion' ? 'En preparación' :
                           pedido.estadoPedido === 'en_camino' ? 'En camino' :
                           String(pedido.estadoPedido).charAt(0).toUpperCase() + String(pedido.estadoPedido).slice(1)}
                        </span>
                      )}
                    </td>
                    <td>{pedido.metodoPago}</td>
                    <td>
                      <div className="d-flex gap-1">
                        {pedido.estadoPedido === 'Pendiente' && (
                          <>
                            <button className="btn btn-sm btn-outline-success" onClick={() => handleAprobarSolicitudAbono(pedido.id, pedido.metodoPago)} title="Aprobar">
                              <i className="fas fa-check"></i>
                            </button>
                            {pedido.metodoPago === 'Abono' && (
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleRechazarAbono(pedido.id)} title="Rechazar">
                                <i className="fas fa-times"></i>
                              </button>
                            )}
                          </>
                        )}
                        <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/pedidos/${pedido.id}`)} title="Ver detalle">
                          <i className="fas fa-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No hay pedidos registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="card-footer">
            <nav>
              <ul className="pagination justify-content-center mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => p - 1)}>Anterior</button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i+1} className={`page-item ${currentPage === i+1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(i+1)}>{i+1}</button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => p + 1)}>Siguiente</button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      {modal === 'crear' && (
        <CrearPedidoModal
          usuarios={usuarios}
          productos={productos}
          form={form}
          setForm={setForm}
          item={item}
          setItem={setItem}
          seleccionarUsuario={seleccionarUsuario}
          setSeleccionarUsuario={setSeleccionarUsuario}
          onSelectProducto={handleSelectProducto}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          totalForm={totalForm}
          onGuardar={guardarPedido}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default PedidosAdmin;
