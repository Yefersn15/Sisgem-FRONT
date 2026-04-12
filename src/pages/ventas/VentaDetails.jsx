import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { getVentaById, getProductos, getPagosByVenta, getTotalPagadoByVenta, formatPrice, cambiarEstadoPago, cambiarEstadoPedido, aprobarSolicitudAbono, rechazarAbono, cambiarEstado, getDomicilioByVentaId } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';

const VentaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isFromPedidos = location.pathname.includes('/pedidos/');
  const { user, role, hasPermission } = useAuth();
  const [pedido, setPedido] = useState(null);
  const [domicilio, setDomicilio] = useState(null);
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

        const dom = await getDomicilioByVentaId(id);
        if (dom) {
          setDomicilio(dom);
        }

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

  const getDeliveryStatusBadge = (estado) => {
    const estados = {
      'pendiente': 'bg-warning text-dark',
      'aprobado': 'bg-info',
      'en_preparacion': 'bg-primary',
      'asignado': 'bg-info',
      'en_camino': 'bg-primary',
      'entregado': 'bg-success',
      'cancelado': 'bg-danger'
    };
    return estados[estado] || 'bg-secondary';
  };

  const estadoOrden = String(pedido?.estadoPedido || pedido?.estado || 'pendiente').toLowerCase();
  const esDomicilio = (pedido?.delivery === true || String(pedido?.tipo_venta || '').toLowerCase() === 'domicilio' || !!pedido?.direccion);
  
  const pasosEntrega = [
    { estado: 'pendiente', label: 'Recibido', icon: 'fa-clipboard-list' },
    { estado: 'aprobado', label: 'Aprobado', icon: 'fa-check' },
    { estado: 'en_preparacion', label: 'Preparando', icon: 'fa-box' },
    { estado: 'asignado', label: 'Asignado', icon: 'fa-motorcycle' },
    { estado: 'en_camino', label: 'En Camino', icon: 'fa-truck' },
    { estado: 'entregado', label: 'Entregado', icon: 'fa-home' }
  ];
  
  const pasosEntregaSinPrep = [
    { estado: 'pendiente', label: 'Recibido', icon: 'fa-clipboard-list' },
    { estado: 'aprobado', label: 'Aprobado', icon: 'fa-check' },
    { estado: 'asignado', label: 'Asignado', icon: 'fa-motorcycle' },
    { estado: 'en_camino', label: 'En Camino', icon: 'fa-truck' },
    { estado: 'entregado', label: 'Entregado', icon: 'fa-home' }
  ];
  
  const estadosConPrep = ['en_preparacion', 'asignado', 'en_camino', 'entregado'];
  const usarTimelineConPrep = estadosConPrep.includes(estadoOrden);
  const pasosMostrar = usarTimelineConPrep ? pasosEntrega : pasosEntregaSinPrep;
  
  const getPasoIndex = (est, pasos) => {
    const idx = pasos.findIndex(p => p.estado === est);
    return idx >= 0 ? idx : 0;
  };
  
  const currentStepIndex = getPasoIndex(estadoOrden, pasosMostrar);
  
  const statusSteps = pasosMostrar.map((paso, idx) => ({
    ...paso,
    isActive: idx <= currentStepIndex,
    isCurrent: idx === currentStepIndex && estadoOrden !== 'cancelado' && estadoOrden !== 'entregado'
  }));

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
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="mb-4">
              <i className="fas fa-shipping-fast me-2"></i>
              Estado del domicilio
            </h5>
            <div className="position-relative" style={{ paddingTop: 24, paddingBottom: 8 }}>
              <div className="position-absolute start-0 end-0" style={{ height: 4, top: 46, background: '#e5e7eb' }}>
                <div className="h-100 bg-success transition-all" style={{ width: `${Math.max(0, currentStepIndex / (pasosMostrar.length - 1) * 100)}%` }} />
              </div>
              <div className="position-relative d-flex justify-content-between">
                {statusSteps.map((step, idx) => (
                  <div key={idx} className="d-flex flex-column align-items-center" style={{ width: '80px' }}>
                    <div className={`rounded-circle d-flex align-items-center justify-content-center border-4 transition ${step.isActive ? 'bg-success border-white text-white' : 'bg-white border-secondary text-secondary'}`} style={{ width: 48, height: 48, ...(step.isCurrent && { boxShadow: '0 0 0 4px rgba(34, 197, 94, 0.3)' }) }}>
                      <i className={`fas ${step.icon}`} style={{ fontSize: '1.25rem' }} />
                    </div>
                    <p className={`mt-2 text-center ${step.isActive ? 'fw-medium text-dark' : 'text-muted'}`} style={{ fontSize: '0.75rem', maxWidth: '80px' }}>
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
                    {(() => {
                      const costoEnvio = parseFloat(pedido.shipping) || parseFloat(domicilio?.tarifa) || 0;
                      if (costoEnvio > 0) {
                        return (
                          <tr>
                            <th colSpan="3" className="text-end">Envío:</th>
                            <td className="text-end">{formatPrice(costoEnvio)}</td>
                          </tr>
                        );
                      }
                      return null;
                    })()}
                    {(() => {
                      const envio = parseFloat(pedido.shipping) || parseFloat(domicilio?.tarifa) || 0;
                      const total = (parseFloat(pedido.subtotal) || 0) + envio;
                      return (
                        <tr className="table-primary">
                          <th colSpan="3" className="text-end">Total:</th>
                          <td className="text-end fw-bold">{formatPrice(total)}</td>
                        </tr>
                      );
                    })()}
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {pedido.metodoPago === 'Abono' && (() => {
          const envio = parseFloat(pedido.shipping) || parseFloat(domicilio?.tarifa) || 0;
          const totalConEnvio = (parseFloat(pedido.subtotal) || 0) + envio;
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
                                    onChange={(e) => handleCambiarEstadoPago(pago.id, e.target.value)}
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
        })()}
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