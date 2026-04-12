import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getPagoById, getVentaById, formatPrice, getDomicilioByVentaId, getPagosByVenta, getPagos } from '../../services/dataService';

const PagoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pago, setPago] = useState(null);
  const [venta, setVenta] = useState(null);
  const [domicilio, setDomicilio] = useState(null);
  const [pagosVenta, setPagosVenta] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let p = null;
      let ventaId = id;
      let esIdPago = false;
      
      // 1. Intentar cargar como pago directo (ID de pago)
      try {
        p = await getPagoById(id);
        if (p && p.id) {
          setPago(p);
          // IMPORTANTE: NO cambiar ventaId aquí, el ID de la URL sigue siendo el objetivo principal
          // Solo guardamos que este ID es un pago para mostrar en el título
          esIdPago = true;
        }
      } catch (e) {
        // No existe pago con ese ID, continuar
      }
      
      // 2. Cargar todos los pagos y filtrar por ventaId (el ID de la URL)
      try {
        const todosLosPagos = await getPagos();
        const misPagos = todosLosPagos.filter(pg => String(pg.ventaId) === String(id));
        if (misPagos.length > 0) {
          setPagosVenta(misPagos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
        }
      } catch (e) {
        console.log('Error cargando pagos');
      }
      
      // 3. Cargar datos del pedido/venta usando el ID de la URL (no el del pago)
      try {
        const v = await getVentaById(id);
        setVenta(v);
      } catch (e) {
        console.log('Error cargando venta');
      }
      
      try {
        const dom = await getDomicilioByVentaId(id);
        setDomicilio(dom);
      } catch (e) {
        console.log('No hay domicilio');
      }
      
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="container mt-4">Cargando...</div>;

  const getBadgeClass = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'aplicado': return 'bg-success';
      case 'pendiente': return 'bg-warning text-dark';
      case 'anulado': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const shipping = domicilio?.costo ? parseFloat(domicilio.costo) : (venta?.shipping || 0);
  const totalVenta = (venta?.subtotal || 0) + shipping;
  
  // Calcular total pagado: incluir tanto aplicados como pendientes
  const totalPagado = pagosVenta
    .filter(p => {
      const estado = String(p.estado)?.toLowerCase();
      return estado === 'aplicado' || estado === 'pendiente';
    })
    .reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
  const saldoPendiente = Math.max(0, totalVenta - totalPagado);

  const ventaId = venta?.id || id;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h3>Detalle {pago ? `Pago #${pago.id}` : `Pedido #${ventaId}`}</h3>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => navigate(-1)}>Volver</button>
          {!pago && venta?.metodoPago === 'Abono' && (
            <button className="btn btn-primary" onClick={() => navigate(`/admin/pagos/nuevo`, { state: { ventaId } })}>Registrar Abono</button>
          )}
        </div>
      </div>

      <div className="card mt-3 p-3">
        <div className="row">
          <div className="col-md-6">
            <h5 className="border-bottom pb-2 mb-3">Información del Pedido</h5>
            <p><strong>Pedido ID:</strong> <Link to={`/ventas/${ventaId}`}>#{ventaId}</Link></p>
            <p><strong>Usuario:</strong> {venta?.usuarioNombre || 'N/A'}</p>
            {venta?.usuarioDocumento && <p><strong>Documento:</strong> {venta.usuarioDocumento}</p>}
            <p><strong>Fecha:</strong> {venta?.fecha ? new Date(venta.fecha).toLocaleString() : 'N/A'}</p>
            <p><strong>Método de Pago:</strong> {venta?.metodoPago || 'N/A'}</p>
            {domicilio && (
              <>
                <p><strong>Domicilio:</strong></p>
                <ul className="list-unstyled ps-3">
                  <li><strong>Dirección:</strong> {domicilio.direccion}</li>
                  <li><strong>Estado:</strong> <span className={`badge ${domicilio.estado === 'Entregado' ? 'bg-success' : 'bg-warning text-dark'}`}>{domicilio.estado}</span></li>
                  {domicilio.repartidor && (
                    <>
                      <li><strong>Repartidor:</strong> {domicilio.repartidor.nombre}</li>
                      <li><strong>Teléfono:</strong> {domicilio.repartidor.telefono}</li>
                    </>
                  )}
                </ul>
              </>
            )}
          </div>
          <div className="col-md-6">
            <h5 className="border-bottom pb-2 mb-3">Información del Pago</h5>
            <p><strong>Total Venta:</strong> {formatPrice(totalVenta)}</p>
            {pago ? (
              <>
                <p><strong>Método:</strong> {pago.metodo || 'N/A'}</p>
                <p><strong>Tipo:</strong> {pago.tipo === 'abono' ? 'Abono' : 'Pago'}</p>
              </>
            ) : (
              <p><strong>Estado:</strong> <span className="badge bg-warning text-dark">Sin registro de pago</span></p>
            )}
            <div className="mt-3 p-2 bg-light rounded">
              <p className="mb-1"><strong>Total Pagado:</strong> {formatPrice(totalPagado)}</p>
              <p className="mb-0"><strong>Saldo Pendiente:</strong> <span className={saldoPendiente > 0 ? 'text-danger' : 'text-success'}>{formatPrice(saldoPendiente)}</span></p>
            </div>
            {venta && (
              <>
                <p><strong>Subtotal productos:</strong> {formatPrice(venta.subtotal || 0)}</p>
                {shipping > 0 && <p><strong>Costo envío:</strong> {formatPrice(shipping)}</p>}
              </>
            )}
          </div>
        </div>
        {(pago?.notas || domicilio?.notas) && (
          <div className="mt-3 pt-2 border-top">
            <p className="mb-1"><strong>Notas:</strong></p>
            <p className="text-muted">{pago?.notas || domicilio?.notas || '-'}</p>
          </div>
        )}
      </div>

      <div className="card mt-3 p-3">
        <h5 className="border-bottom pb-2 mb-3">Historial de Abonos</h5>
        <div className="table-responsive" style={{ maxHeight: '300px' }}>
          <table className="table table-sm table-hover">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Fecha</th>
                <th style={{ width: '30%' }}>Método</th>
                <th style={{ width: '30%' }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {pagosVenta.length > 0 ? pagosVenta.map((p, idx) => (
                <tr key={p.id || idx}>
                  <td>{p.fecha ? new Date(p.fecha).toLocaleString() : 'N/A'}</td>
                  <td>
                    <span className={`badge ${String(p.estado).toLowerCase() === 'aplicado' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {p.metodo || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={String(p.estado).toLowerCase() === 'pendiente' ? 'text-warning' : ''}>
                      {formatPrice(p.monto || 0)}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="text-center text-muted">No hay abonos realizados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {venta && venta.productos && venta.productos.length > 0 && (
        <div className="card mt-3 p-3">
          <h5 className="border-bottom pb-2 mb-3">Productos del Pedido</h5>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {venta.productos.map((it, idx) => (
                  <tr key={idx}>
                    <td>{(it.productoSnapshot && it.productoSnapshot.nombre) || 'Producto'}</td>
                    <td>{it.cantidad || 0}</td>
                    <td>{formatPrice(it.precioUnitario || 0)}</td>
                    <td>{formatPrice(it.subtotal || (it.cantidad * (it.precioUnitario || 0)))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-end"><strong>Subtotal:</strong></td>
                  <td><strong>{formatPrice(venta.subtotal || 0)}</strong></td>
                </tr>
                {venta.shipping > 0 && (
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Envío:</strong></td>
                    <td><strong>{formatPrice(venta.shipping)}</strong></td>
                  </tr>
                )}
                <tr>
                  <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                  <td><strong>{formatPrice((venta.subtotal || 0) + (venta.shipping || 0))}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagoDetail;