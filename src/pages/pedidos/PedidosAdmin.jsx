// src/pages/pedidos/PedidosAdmin.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPedidos, cambiarEstadoPedido, formatPrice } from '../../services/dataService';
import { aprobarSolicitudAbono, rechazarAbono } from '../../services/dataService';

const PedidosAdmin = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [filterEstado, setFilterEstado] = useState('');
  const [filterMetodo, setFilterMetodo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  // pagos modal removed: payment management is on VentaDetails

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    const lista = await getPedidos();
    setPedidos(lista);
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    await cambiarEstadoPedido(id, nuevoEstado);
    cargarPedidos();
  };

  const handleAprobarSolicitudAbono = async (pedidoId, metodoPago) => {
    const esAbono = metodoPago === 'Abono';
    const mensaje = esAbono 
      ? '¿Aprobar este pedido por Abono?\n\nEl cliente podrá hacer pagos parciales.\nEl stock se reducirá al entregar.'
      : '¿Aprobar este pedido para envío?\n\nEl stock se reducirá al entregar.';
    if (!window.confirm(mensaje)) return;
    try {
      await aprobarSolicitudAbono(pedidoId);
      cargarPedidos();
    } catch (e) {
      alert('Error aprobando: ' + (e?.message || e));
    }
  };

  const handleRechazarAbono = async (pedidoId) => {
    const motivo = prompt('Ingrese el motivo del rechazo (opcional):');
    if (motivo === null) return;
    try {
      await rechazarAbono(pedidoId, motivo);
      cargarPedidos();
    } catch (e) {
      alert('Error rechazando solicitud: ' + (e?.message || e));
    }
  };

const filtered = useMemo(() => {
    let list = pedidos;
    if (filterEstado) list = list.filter(p => p.estadoPedido === filterEstado);
    if (filterMetodo) list = list.filter(p => p.metodoPago === filterMetodo);
    if (busqueda) {
      const q = busqueda.toLowerCase();
      list = list.filter(p => String(p.id).includes(q) || p.usuarioNombre?.toLowerCase().includes(q));
    }
  return list.sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
}, [pedidos, filterEstado, filterMetodo, busqueda]);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Gestión de Pedidos</h2>
          <p className="text-muted mb-0">Administra los pedidos y solicitudes</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <input className="form-control" placeholder="Buscar por ID o usuario" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
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
              <select className="form-select" value={filterMetodo} onChange={e => setFilterMetodo(e.target.value)}>
                <option value="">Todos los métodos</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Abono">Abono</option>
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-secondary w-100" onClick={() => { setBusqueda(''); setFilterEstado(''); setFilterMetodo(''); }}>
                <i className="fas fa-eraser me-1"></i>Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Método</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(pedido => (
                  <tr key={pedido.id}>
                    <td>{pedido.tipo_venta === 'domicilio' ? 'Solicitar Domicilio' : 'Mostrador'}</td>
                    <td>#{pedido.id}</td>
                    <td>{new Date(pedido.fecha).toLocaleString()}</td>
                    <td>{pedido.usuarioNombre || 'Usuario'}</td>
                    <td>{formatPrice(pedido.total)}</td>
                    <td>
                      {pedido.metodoPago === 'Abono' && pedido.estadoPedido === 'pendiente' ? (
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-success" onClick={() => handleAprobarSolicitudAbono(pedido.id)} title="Aprobar abono (confirma pago)">
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
                          {pedido.estadoPedido === 'en_preparacion' ? 'En Preparación' : 
                           pedido.estadoPedido === 'en_camino' ? 'En Camino' :
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
                        <button className="btn btn-sm btn-outline-info" onClick={() => navigate(`/pedidos/${pedido.id}`)} title="Ver detalle">
                          <i className="fas fa-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PedidosAdmin;