import { Link } from 'react-router-dom';
import { formatPrice } from '../../services/api/utils';
import { useVentasAdmin } from './hooks/useVentasAdmin';
import { useVentaBuilder } from './hooks/useVentaBuilder';
import { formatFecha, getMetodoBadge } from './hooks/ventaFormatters';
import VentaModal from './components/VentaModal';

const ESTADO_BADGES = {
  pendiente: 'bg-warning',
  por_validar: 'bg-info',
  completada: 'bg-success',
  anulada: 'bg-danger',
  rechazada: 'bg-danger',
  cancelado: 'bg-secondary',
};
const getEstadoBadge = (estado) => ESTADO_BADGES[estado] || 'bg-secondary';

const VentasAdmin = () => {
  const {
    usuarios,
    productos,
    filterEstado,
    setFilterEstado,
    filterMetodo,
    setFilterMetodo,
    query,
    setQuery,
    clearFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    currentVentas,
    cargarVentas,
    anularVenta,
    aprobarVenta,
    generarReporte,
  } = useVentasAdmin();

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
    handleEdit,
    addItem,
    removeItem,
    totalForm,
    guardarVenta,
    actualizarVenta,
  } = useVentaBuilder(productos, cargarVentas);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Gestión de Ventas</h2>
          <p className="text-muted mb-0">Administra las ventas y pedidos</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={generarReporte}>
            <i className="fas fa-file-export me-1"></i>Exportar
          </button>
          <button className="btn btn-primary" onClick={handleCreate}>
            <i className="fas fa-plus me-1"></i>Nueva Venta
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="por_validar">Por validar</option>
                <option value="completada">Completada</option>
                <option value="anulada">Anulada</option>
                <option value="rechazada">Rechazada</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterMetodo}
                onChange={(e) => setFilterMetodo(e.target.value)}
              >
                <option value="">Todos los métodos</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Abono">Abono</option>
              </select>
            </div>
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Buscar por ID, usuario o teléfono..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button className="btn btn-secondary w-100" onClick={clearFilters}>
                <i className="fas fa-eraser me-1"></i>Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th className="text-end">Subtotal</th>
                  <th className="text-end">Envío</th>
                  <th className="text-end">Total</th>
                  <th>Estado</th>
                  <th>Método</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentVentas.length > 0 ? (
                  currentVentas.map((venta) => (
                    <tr key={venta.id}>
                      <td>{formatFecha(venta.fecha)}</td>
                      <td>{venta.usuarioNombre || 'Usuario no registrado'}</td>
                      <td className="text-end">{formatPrice(venta.subtotal)}</td>
                      <td className="text-end">{formatPrice(venta.shipping)}</td>
                      <td className="text-end fw-medium">{formatPrice(venta.total)}</td>
                      <td>
                        <span className={`badge ${getEstadoBadge(venta.estadoVenta)}`}>
                          {venta.estadoVenta}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getMetodoBadge(venta.metodoPago)}`}>
                          {venta.metodoPago}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Link
                            to={`/ventas/${venta.id}`}
                            className="btn btn-sm btn-outline-info"
                            title="Ver detalle"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            title="Editar"
                            onClick={() => handleEdit(venta)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          {venta.estadoVenta !== 'anulada' && venta.estadoVenta !== 'completada' && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              title="Aprobar"
                              onClick={() => aprobarVenta(venta.id)}
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          )}
                          {venta.estadoVenta !== 'anulada' && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              title="Anular"
                              onClick={() => anularVenta(venta.id)}
                            >
                              <i className="fas fa-ban"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      No hay ventas registradas
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
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      {(modal === 'crear' || modal === 'editar') && (
        <VentaModal
          modal={modal}
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
          onSubmit={modal === 'crear' ? guardarVenta : actualizarVenta}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default VentasAdmin;
