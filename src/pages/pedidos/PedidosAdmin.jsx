// src/pages/pedidos/PedidosAdmin.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPedidos, cambiarEstadoPedido, convertirPedidoAVenta, formatPrice } from '../../services/dataService';
import { aprobarSolicitudAbono } from '../../services/dataService';

const PedidosAdmin = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [filterEstado, setFilterEstado] = useState('');
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

  const handleConvertir = async (id) => {
    if (window.confirm('Convertir este pedido a venta?')) {
      await convertirPedidoAVenta(id);
      cargarPedidos();
    }
  };

  // payment actions moved to VentaDetails

  const handleAprobarSolicitudAbono = async (pedidoId) => {
    if (!window.confirm('¿Aprobar la solicitud de abono para este pedido?')) return;
    try {
      await aprobarSolicitudAbono(pedidoId);
      cargarPedidos();
    } catch (e) {
      alert('Error aprobando solicitud: ' + (e?.message || e));
    }
  };

  const filtered = useMemo(() => {
    let list = pedidos;
    if (filterEstado) list = list.filter(p => p.estadoPedido === filterEstado);
    if (busqueda) {
      const q = busqueda.toLowerCase();
      list = list.filter(p => String(p.id).includes(q) || p.usuarioNombre?.toLowerCase().includes(q));
    }
    return list.sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
  }, [pedidos, filterEstado, busqueda]);

  const puedeConvertir = (pedido) => {
    if (pedido.metodoPago === 'Abono') {
      return pedido.estadoPedido === 'entregado' && (pedido.total_pagado >= pedido.total);
    }
    return pedido.estadoPedido === 'entregado';
  };

  return (
    <div className="container-fluid mt-4">
      <h2>Gestión de Pedidos</h2>
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <input className="form-control" placeholder="Buscar por ID o usuario" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="aprobado">Aprobado</option>
                <option value="enviado">Enviado</option>
                <option value="recibido">Recibido</option>
                <option value="cancelado">Cancelado</option>
                <option value="anulado">Anulado</option>
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-secondary" onClick={() => { setBusqueda(''); setFilterEstado(''); }}>Limpiar</button>
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
                          <button className="btn btn-sm btn-success" onClick={() => handleAprobarSolicitudAbono(pedido.id)}>Aprobar abono</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleCambiarEstado(pedido.id, 'cancelado')}>Rechazar</button>
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
                        <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/pedidos/${pedido.id}`)}>Ver</button>
                        {pedido.metodoPago === 'Abono' && pedido.estadoPedido === 'pendiente' && (
                          <>
                            {/* Buttons shown in Estado column; no extra action here */}
                          </>
                        )}
                        {puedeConvertir(pedido) && (
                          <button className="btn btn-sm btn-success" onClick={() => handleConvertir(pedido.id)}>Convertir a Venta</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Payment modal removed: use VentaDetails for payment approvals */}
    </div>
  );
};

export default PedidosAdmin;