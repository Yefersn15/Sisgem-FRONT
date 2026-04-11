import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { getVentaById, getProductos, getPagosByVenta, getTotalPagadoByVenta, formatPrice, cambiarEstadoPago, cambiarEstadoPedido, aprobarSolicitudAbono, rechazarAbono, cambiarEstado } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';

const VentaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isFromPedidos = location.pathname.includes('/pedidos/');
  const { user, role, hasPermission } = useAuth();
  const [pedido, setPedido] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [totalPagado, setTotalPagado] = useState(0);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = role?.nombre === 'ADMIN' || role?.nombre === 'Administrador' || user?.rol_id === 5;
  const canConfirmPayment = isAdmin || hasPermission('Ventas');

  useEffect(() => {
    (async () => {
      if (!id || id === 'undefined') {
        alert('ID de pedido inválido');
        navigate('/admin/ventas');
        return;
      }
      try {
        const p = await getVentaById(id);
        if (!p) {
          alert('Pedido no encontrado');
          navigate('/admin/ventas');
          return;
        }
        setPedido(p);

        const prods = await getProductos() || [];
        setProductos(prods);

        const pagosVenta = await getPagosByVenta(id);
        setPagos(pagosVenta || []);
        const total = await getTotalPagadoByVenta(id);
        setTotalPagado(total || 0);
      } catch (error) {
        console.error('Error al cargar pedido:', error);
        alert('Error al cargar los detalles del pedido: ' + (error.message || 'Error desconocido'));
        navigate('/admin/ventas');
        return;
      }

      setLoading(false);
    })();
  }, [id]);

  const getProductoNombre = (productoId) => {
    if (!productoId) return 'Producto desconocido';
    const producto = productos.find(p => p.id === productoId);
    if (producto) return producto.nombre;
    const item = pedido?.productos?.find(i => i.productoId === productoId);
    return item?.productoSnapshot?.nombre || 'Producto';
  };

  const getProductoFoto = (productoId) => {
    const producto = productos.find(p => p.id === productoId);
    return producto?.fotoUrl || '';
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      'pendiente': 'bg-warning',
      'aprobado': 'bg-info',
      'enviado': 'bg-primary',
      'recibido': 'bg-success',
      'cancelado': 'bg-danger',
      'anulado': 'bg-secondary',
      'por_validar': 'bg-info',
      'completada': 'bg-success',
      'rechazada': 'bg-danger'
    };
    return estados[estado] || 'bg-secondary';
  };

  const getMetodoBadge = (metodo) => {
    const metodos = {
      'Efectivo': 'bg-success',
      'Transferencia': 'bg-info',
      'Abono': 'bg-warning'
    };
    return metodos[metodo] || 'bg-secondary';
  };

  const handleCambiarEstadoPago = async (pagoId, estado) => {
    if (!canConfirmPayment) { alert('No tiene permisos'); return; }
    try {
      await cambiarEstadoPago(pagoId, estado);
      const pagosVenta = await getPagosByVenta(id) || [];
      setPagos(pagosVenta);
      const total = await getTotalPagadoByVenta(id);
      setTotalPagado(total || 0);
      const p = await getVentaById(id);
      setPedido(p);
    } catch (e) {
      console.error('Error cambiando estado de pago:', e);
      alert('Error cambiando estado de pago: ' + (e.message || e));
    }
  };

  const handleAvanzarEstado = async (nuevoEstado) => {
    if (!isAdmin) { alert('No tiene permisos'); return; }
    try {
      await cambiarEstado(id, nuevoEstado);
      const p = await getVentaById(id);
      setPedido(p);
    } catch (e) {
      alert('Error advancing state: ' + (e.message || e));
    }
  };

  const handleAceptarAbono = async (aceptar) => {
    if (!canConfirmPayment) { alert('No tiene permisos'); return; }
    try {
      if (aceptar) {
        await aprobarSolicitudAbono(id);
        alert('Solicitud de abono aprobada. Stock reducido.');
      } else {
        const motivo = prompt('Ingrese el motivo del rechazo (opcional):');
        await rechazarAbono(id, motivo);
        alert('Abono rechazado.');
      }
      const p = await getVentaById(id);
      setPedido(p);
    } catch (e) {
      console.error('Error actualizando estado del pedido:', e);
      alert('Error actualizando estado del pedido: ' + (e.message || e));
    }
  };

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
  const estadoMostrar = esPedido ? pedido.estadoPedido : pedido.estadoVenta;

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
            {esPedido && isAdmin && (
              <>
                {/* Botones de flujo de domicilio - solo para efectivo/transferencia */}
                {pedido?.estadoPedido === 'Pendiente' && pedido?.metodoPago !== 'Abono' && (
                  <button className="btn btn-success ms-2" onClick={() => handleAvanzarEstado('aprobado')}>
                    Aprobar y Preparar
                  </button>
                )}
                {pedido?.estadoPedido === 'aprobado' && (
                  <button className="btn btn-warning ms-2" onClick={() => handleAvanzarEstado('en_preparacion')}>
                    En Preparación
                  </button>
                )}
                {pedido?.estadoPedido === 'en_preparacion' && pedido.tipo_venta === 'domicilio' && (
                  <button className="btn btn-info ms-2" onClick={() => handleAvanzarEstado('asignado')}>
                    Asignar Repartidor
                  </button>
                )}
                {pedido?.estadoPedido === 'asignado' && (
                  <button className="btn btn-primary ms-2" onClick={() => handleAvanzarEstado('en_camino')}>
                    En Camino
                  </button>
                )}
                {pedido?.estadoPedido === 'en_camino' && (
                  <button className="btn btn-success ms-2" onClick={() => handleAvanzarEstado('entregado')}>
                    Entregado
                  </button>
                )}
                
                {/* Botones de abono */}
                {pedido?.metodoPago === 'Abono' && pedido?.estadoPedido === 'Pendiente' && canConfirmPayment && (
                  <>
                    <button className="btn btn-outline-success ms-2" onClick={() => handleAceptarAbono(true)}>Aprobar Abono</button>
                    <button className="btn btn-outline-danger ms-2" onClick={() => handleAceptarAbono(false)}>Rechazar Abono</button>
                  </>
                )}
                {esPedido && pedido.metodoPago === 'Abono' && pedido.estadoPedido === 'entregado' && canConfirmPayment && (
                  <button 
                    className="btn btn-outline-primary ms-2" 
                    onClick={() => navigate(`/admin/pagos/nuevo`, { state: { ventaId: id } })}
                  >
                    <i className="fas fa-hand-holding-usd me-1"></i> Registrar Pago
                  </button>
                )}
              </>
            )}
        </div>
      </div>

      <div className="alert d-flex align-items-center justify-content-between">
        <div>
          <strong>Estado:</strong>{' '}
          <span className={`badge ${getEstadoBadge(estadoMostrar)} fs-6`}>
            {estadoMostrar}
          </span>
        </div>
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
                    {pedido.shipping > 0 && (
                      <tr>
                        <th colSpan="3" className="text-end">Envío:</th>
                        <td className="text-end">{formatPrice(pedido.shipping)}</td>
                      </tr>
                    )}
                    <tr className="table-primary">
                      <th colSpan="3" className="text-end">Total:</th>
                      <td className="text-end fw-bold">{formatPrice((parseFloat(pedido.subtotal) || 0) + (parseFloat(pedido.shipping) || 0))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {pedido.metodoPago === 'Abono' && (
            <div className="card mb-4">
              <div className="card-header"><h5 className="mb-0"><i className="fas fa-hand-holding-usd me-2"></i>Abonos</h5></div>
              <div className="card-body">
                <p className="mb-1"><strong>Total {esPedido ? 'pedido' : 'venta'}:</strong> {formatPrice(pedido.total)}</p>
                <p className="mb-1"><strong>Total pagado:</strong> {formatPrice(totalPagado)}</p>
                <p className="mb-0"><strong>Saldo pendiente:</strong> {formatPrice(Math.max(0, (pedido.total || 0) - totalPagado))}</p>
              </div>
            </div>
          )}

          {pagos.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0"><i className="fas fa-money-bill-wave me-2"></i>Pagos</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Fecha</th>
                        <th>Método</th>
                        <th>Referencia</th>
                        <th className="text-end">Monto</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagos.map((pago) => (
                        <tr key={pago.id}>
                          <td>{formatFecha(pago.fecha)}</td>
                          <td>{pago.metodo}</td>
                          <td>{pago.referencia || '-'}</td>
                          <td className="text-end">{formatPrice(pago.monto)}</td>
                          <td>
                            <span className={`badge ${getEstadoBadge(pago.estado)}`}>
                              {pago.estado}
                            </span>
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

        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0"><i className="fas fa-user me-2"></i>Cliente</h5>
            </div>
            <div className="card-body">
              {pedido.usuarioNombre ? (
                <>
                  <p className="mb-1"><strong>Nombre:</strong> {pedido.usuarioNombre}</p>
                  {pedido.usuarioId && <p className="mb-1"><strong>ID:</strong> {pedido.usuarioId}</p>}
                  <p className="mb-1"><strong>Teléfono:</strong> {pedido.telefono || pedido.telefonoContacto || '-'}</p>
                  {pedido.direccion && (
                    <>
                      <p className="mb-1"><strong>Dirección:</strong> {pedido.direccion}</p>
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