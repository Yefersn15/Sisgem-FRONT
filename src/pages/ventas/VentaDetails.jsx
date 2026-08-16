import { useParams, Link, useLocation } from 'react-router-dom';
import { formatPrice } from '../../services/dataService';
import { useVentaDetalle } from './hooks/useVentaDetalle';
import { formatFecha, getMetodoBadge } from './hooks/ventaFormatters';
import DeliveryTimeline from './components/DeliveryTimeline';
import PagosAbono from './components/PagosAbono';

const VentaDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const isFromPedidos = location.pathname.includes('/pedidos/');
  const {
    pedido,
    domicilio,
    pagos,
    totalPagado,
    loading,
    canConfirmPayment,
    getProductoNombre,
    getProductoFoto,
    estadoOrden,
    esDomicilio,
    statusSteps,
    currentStepIndex,
    handleCambiarEstadoPago,
  } = useVentaDetalle(id);

  if (loading) {
    return (
      <div className="container my-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!pedido) return null;

  const esPedido = !pedido.esVenta;
  const envio = parseFloat(pedido.shipping) || parseFloat(domicilio?.tarifa) || 0;
  const totalConEnvio = (parseFloat(pedido.subtotal) || 0) + envio;

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>{esPedido ? 'Detalle de Pedido' : 'Detalle de Venta'} #{pedido.id}</h2>
          <p className="text-muted mb-0">
            <i className="fas fa-calendar-alt me-1"></i>
            {formatFecha(pedido.fecha)}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to={isFromPedidos ? '/admin/pedidos' : '/admin/ventas'} className="btn btn-outline-secondary">
            <i className="fas fa-arrow-left me-1"></i> Volver
          </Link>
        </div>
      </div>

      <div className="alert d-flex align-items-center justify-content-between">
        <div>
          <strong>Método de pago:</strong>{' '}
          <span className={`badge ${getMetodoBadge(pedido.metodoPago)} fs-6`}>
            {pedido.metodoPago}
          </span>
        </div>
        <div>
          <strong>Tipo:</strong>{' '}
          <span className={`badge ${esPedido ? 'bg-info' : 'bg-success'} fs-6`}>
            {esPedido ? 'Pedido' : 'Venta'}
          </span>
        </div>
      </div>

      {((esDomicilio || !!pedido?.direccion) && estadoOrden !== 'cancelado') && (
        <DeliveryTimeline statusSteps={statusSteps} currentStepIndex={currentStepIndex} />
      )}

      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0"><i className="fas fa-box me-2"></i>Productos</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Producto</th>
                      <th className="text-center">Cantidad</th>
                      <th className="text-end">Precio</th>
                      <th className="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(pedido.productos || []).map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="d-flex align-items-center">
                            {item.productoSnapshot?.fotoUrl || getProductoFoto(item.productoId) ? (
                              <img
                                src={item.productoSnapshot?.fotoUrl || getProductoFoto(item.productoId)}
                                alt={getProductoNombre(item.productoId)}
                                className="me-2"
                                style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                              />
                            ) : (
                              <div className="me-2 bg-light d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, borderRadius: 4 }}>
                                <i className="fas fa-box text-muted"></i>
                              </div>
                            )}
                            <div>
                              <div className="fw-medium">
                                {item.productoSnapshot?.nombre || getProductoNombre(item.productoId)}
                              </div>
                              {item.productoSnapshot?.codigoBarras && (
                                <small className="text-muted">{item.productoSnapshot.codigoBarras}</small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-center">{item.cantidad}</td>
                        <td className="text-end">{formatPrice(item.precioUnitario)}</td>
                        <td className="text-end fw-medium">{formatPrice(item.subtotal)}</td>
                      </tr>
                    ))}
                    {(!pedido.productos || pedido.productos.length === 0) && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-4">
                          No hay productos en este {esPedido ? 'pedido' : 'venta'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <th colSpan="3" className="text-end">Subtotal:</th>
                      <td className="text-end">{formatPrice(pedido.subtotal)}</td>
                    </tr>
                    {envio > 0 && (
                      <tr>
                        <th colSpan="3" className="text-end">Envío:</th>
                        <td className="text-end">{formatPrice(envio)}</td>
                      </tr>
                    )}
                    <tr className="table-primary">
                      <th colSpan="3" className="text-end">Total:</th>
                      <td className="text-end fw-bold">{formatPrice(totalConEnvio)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {pedido.metodoPago === 'Abono' && (
            <PagosAbono
              totalConEnvio={totalConEnvio}
              totalPagado={totalPagado}
              pagos={pagos}
              canConfirmPayment={canConfirmPayment}
              onCambiarEstadoPago={handleCambiarEstadoPago}
            />
          )}
        </div>

        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0"><i className="fas fa-user me-2"></i>Cliente</h5>
            </div>
            <div className="card-body">
              {pedido.usuarioNombre ? (
                <>
                  <p className="mb-1"><strong>Nombre:</strong> {pedido.usuarioNombre}</p>
                  {pedido.usuarioDocumento && <p className="mb-1"><strong>Documento:</strong> {pedido.usuarioDocumento}</p>}
                  {pedido.usuarioId && <p className="mb-1"><strong>ID:</strong> {pedido.usuarioId}</p>}
                  <p className="mb-1"><strong>Teléfono:</strong> {pedido.telefono || pedido.telefonoContacto || '-'}</p>
                  {pedido.direccion && (
                    <>
                      {pedido.tipo && <p className="mb-1"><strong>Tipo:</strong> {pedido.tipo === 'casa' ? 'Casa' : pedido.tipo === 'apartamento' ? 'Apartamento' : pedido.tipo === 'oficina' ? 'Oficina' : pedido.tipo}</p>}
                      <p className="mb-1"><strong>Dirección:</strong> {pedido.direccion}{pedido.direccion2 ? `, ${pedido.direccion2}` : ''}</p>
                      {pedido.barrio && <p className="mb-1"><strong>Barrio:</strong> {pedido.barrio}</p>}
                    </>
                  )}
                </>
              ) : (
                <p className="text-muted mb-0">Usuario no registrado</p>
              )}
            </div>
          </div>

          {pedido.observaciones && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0"><i className="fas fa-sticky-note me-2"></i>Notas</h5>
              </div>
              <div className="card-body">
                <p className="mb-0">{pedido.observaciones}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VentaDetails;
