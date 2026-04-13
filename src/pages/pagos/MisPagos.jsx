// src/pages/pagos/MisPagos.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getPagos, getMisPedidos, formatPrice } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';

const MisPagos = () => {
  const { user } = useAuth();
  const [pagos, setPagos] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [search, setSearch] = useState('');
  const [filterEstadoPago, setFilterEstadoPago] = useState('Todos');

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        const misPedidosData = await getMisPedidos();
        const todosPagos = await getPagos();
        
        setRegistros(misPedidosData);
        setPagos(todosPagos);
      };
      loadData();
    }
  }, [user]);

  const ventasConPagos = useMemo(() => {
    const estadosExcluidos = ['rechazado', 'cancelado', 'anulado'];
    const abonos = registros.filter(r => 
      (r.metodo_pago || r.metodoPago) === 'Abono' &&
      !estadosExcluidos.includes(String(r.estado_pedido || r.estadoPedido || '').toLowerCase())
    );
    return abonos.map(registro => {
      const subtotal = parseFloat(registro.subtotal) || 0;
      const shipping = parseFloat(registro.shipping) || 0;
      const totalVenta = subtotal + shipping;
      const metodoPago = registro.metodo_pago || registro.metodoPago || '';
      const esAbono = metodoPago === 'Abono';
      const esVenta = registro.es_venta || registro.esVenta;
      
      const pagosVenta = pagos.filter(p => String(p.ventaId) === String(registro._id || registro.id));
      const totalPagado = pagosVenta
        .filter(p => {
          const estado = String(p.estado).toLowerCase();
          return estado === 'aplicado' || estado === 'pendiente';
        })
        .reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
      
      let saldoPendiente = 0;
      let estadoPago = 'Completado';
      
      if (esAbono) {
        saldoPendiente = Math.max(0, totalVenta - totalPagado);
        estadoPago = saldoPendiente <= 0 ? 'Pagado' : 'Pendiente';
      } else if (!esVenta) {
        saldoPendiente = totalVenta;
        estadoPago = 'Pendiente';
      }
      
      const primerPagoId = pagosVenta.length > 0 ? pagosVenta[0].id : null;
      return {
        ...registro,
        id: registro._id || registro.id,
        fecha: registro.fecha_pedido || registro.fecha || registro.createdAt || registro.updatedAt,
        totalVenta,
        metodoPago,
        esAbono,
        esVenta,
        totalPagado,
        saldoPendiente,
        estadoPago,
        primerPagoId
      };
    });
  }, [registros, pagos]);

  const filtered = useMemo(() => {
    let lista = ventasConPagos;
    if (filterEstadoPago !== 'Todos') {
      lista = lista.filter(v => v.estadoPago === filterEstadoPago);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      lista = lista.filter(v =>
        String(v.id).includes(q) ||
        (v.metodo_pago || '').toLowerCase().includes(q)
      );
    }
    return lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [ventasConPagos, filterEstadoPago, search]);

  const getMetodoBadge = (metodo) => {
    switch (metodo) {
      case 'Efectivo': return 'bg-success';
      case 'Transferencia': return 'bg-info';
      case 'Abono': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  };

  const getEstadoBadge = (estadoPago, esVenta, esAbono) => {
    if (esVenta && !esAbono) return 'bg-success';
    if (estadoPago === 'Pagado') return 'bg-success';
    return 'bg-warning text-dark';
  };

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
              <button className="btn btn-secondary" onClick={() => { setSearch(''); setFilterEstadoPago('Todos'); }}>
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