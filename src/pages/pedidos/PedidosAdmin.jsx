// src/pages/pedidos/PedidosAdmin.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPedidos, cambiarEstadoPedido, formatPrice, createPedido, getUsuarios, getProductos } from '../../services/dataService';
import { aprobarSolicitudAbono, rechazarAbono } from '../../services/dataService';

const TIPOS_PEDIDO = [
  { value: 'mostrador', label: 'Mostrador' },
  { value: 'domicilio', label: 'Domicilio' }
];

const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Abono'];

const PedidosAdmin = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [filterEstado, setFilterEstado] = useState('');
  const [filterMetodo, setFilterMetodo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    tipoVenta: 'mostrador',
    metodoPago: 'Efectivo',
    items: [],
    notas: '',
    delivery: false,
    direccion: '',
    telefono: '',
    usuarioId: '',
    nombreComprador: ''
  });
  const [item, setItem] = useState({ productoId: '', nombre: '', cantidad: 1, precio: 0 });
  const [seleccionarUsuario, setSeleccionarUsuario] = useState(true);

  useEffect(() => {
    cargarPedidos();
    cargarUsuarios();
    cargarProductos();
  }, []);

  const cargarUsuarios = async () => {
    const lista = await getUsuarios();
    setUsuarios(lista);
  };

  const cargarProductos = async () => {
    try {
      let lista = await getProductos();
      if (!Array.isArray(lista)) lista = lista?.data || lista || [];
      console.log('Productos cargados:', lista);
      setProductos(lista);
    } catch (e) {
      console.error('Error cargando productos:', e);
      setProductos([]);
    }
  };

  const cargarPedidos = async () => {
    const lista = await getPedidos();
    setPedidos(lista);
    setCurrentPage(1);
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

  const handleCreate = () => {
    setForm({
      tipoVenta: 'mostrador',
      metodoPago: 'Efectivo',
      items: [],
      notas: '',
      delivery: false,
      direccion: '',
      telefono: '',
      usuarioId: '',
      nombreComprador: ''
    });
    setItem({ productoId: '', nombre: '', cantidad: 1, precio: 0 });
    setSeleccionarUsuario(true);
    setModal('crear');
  };

  const handleSelectProducto = (productoId) => {
    const producto = productos.find(p => p._id === productoId || p.id === productoId);
    if (producto) {
      setItem({
        productoId: producto._id || producto.id,
        nombre: producto.nombre,
        cantidad: 1,
        precio: producto.precioVenta || producto.precio || 0
      });
    }
  };

  const addItem = () => {
    if (!item.nombre.trim() || item.cantidad <= 0 || item.precio <= 0) return;
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { ...item, id: Date.now(), subtotal: item.cantidad * item.precio }]
    }));
    setItem({ productoId: '', nombre: '', cantidad: 1, precio: 0 });
  };

  const removeItem = (id) => setForm(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));

  const totalForm = form.items.reduce((s, i) => s + (i.cantidad * i.precio), 0);

  const guardarPedido = async () => {
    if (form.items.length === 0) return alert('Agregue al menos un producto');
    if (!seleccionarUsuario && !form.nombreComprador.trim()) return alert('Ingrese nombre del comprador');
    if (seleccionarUsuario && !form.usuarioId) return alert('Seleccione un usuario');
    if (form.delivery && !form.direccion.trim()) return alert('Ingrese dirección de entrega');
    if (form.delivery && !form.telefono.trim()) return alert('Ingrese teléfono de contacto');
    
    try {
      await createPedido({
        usuarioId: seleccionarUsuario ? form.usuarioId : null,
        nombre_comprador: seleccionarUsuario ? undefined : form.nombreComprador.trim(),
        tipo_venta: form.delivery ? 'domicilio' : 'mostrador',
        productos: form.items.map(i => ({
          producto: i.productoId,
          cantidad: i.cantidad,
          precio_unitario: i.precio
        })),
        subtotal: totalForm,
        total: totalForm,
        observaciones: form.notas,
        metodo_pago: form.metodoPago,
        telefono: form.delivery ? form.telefono : '',
        direccion: form.delivery ? form.direccion : ''
      });
      setModal(null);
      cargarPedidos();
    } catch (err) {
      alert(err.message || 'Error al crear pedido');
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

  // Paginación
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

      {/* Filtros */}
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
              <button className="btn btn-outline-secondary w-100" onClick={() => { setBusqueda(''); setFilterEstado(''); setFilterMetodo(''); setCurrentPage(1); }}>
                <i className="fas fa-eraser me-1"></i>Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
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

        {/* Paginación */}
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

      {/* Modal Crear Pedido */}
      {modal === 'crear' && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg m-auto">
            <div className="modal-content">
              <div className="modal-body p-3" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                <button type="button" className="btn-close position-absolute top-0 end-0 m-3" onClick={() => setModal(null)}></button>
                <div className="row g-3">
                  <div className="col-12 mb-3">
                    <label className="form-label fw-bold">¿Quién hace el pedido?</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input type="radio" className="form-check-input" id="selUser" checked={seleccionarUsuario} onChange={() => setSeleccionarUsuario(true)} />
                        <label className="form-check-label" htmlFor="selUser">Usuario registrado</label>
                      </div>
                      <div className="form-check">
                        <input type="radio" className="form-check-input" id="selNombre" checked={!seleccionarUsuario} onChange={() => setSeleccionarUsuario(false)} />
                        <label className="form-check-label" htmlFor="selNombre">Solo nombre del comprador</label>
                      </div>
                    </div>
                  </div>

                  {seleccionarUsuario ? (
                    <div className="col-md-6">
                      <label className="form-label">Seleccionar Usuario</label>
                      <select className="form-select" value={form.usuarioId} onChange={(e) => setForm({ ...form, usuarioId: e.target.value })}>
                        <option value="">Seleccione...</option>
                        {usuarios.map(u => (
                          <option key={u.id} value={u.id}>{u.nombre} {u.apellido} ({u.documento})</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="col-md-6">
                      <label className="form-label">Nombre del Comprador</label>
                      <input className="form-control" value={form.nombreComprador} onChange={(e) => setForm({ ...form, nombreComprador: e.target.value })} placeholder="Nombre completo" />
                    </div>
                  )}

                  <div className="col-md-3">
                    <label className="form-label">Tipo de Pedido</label>
                    <select className="form-select" value={form.tipoVenta} onChange={(e) => setForm({ ...form, tipoVenta: e.target.value, delivery: e.target.value === 'domicilio' })}>
                      {TIPOS_PEDIDO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Método de Pago</label>
                    <select className="form-select" value={form.metodoPago} onChange={(e) => setForm({ ...form, metodoPago: e.target.value })}>
                      {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <div className="form-check mt-4">
                      <input type="checkbox" className="form-check-input" id="deliveryPed" checked={!!form.delivery} onChange={(e) => setForm({ ...form, delivery: e.target.checked, tipoVenta: e.target.checked ? 'domicilio' : 'mostrador' })} />
                      <label className="form-check-label" htmlFor="deliveryPed">Requiere Delivery/Domicilio</label>
                    </div>
                  </div>

                  {form.delivery && (
                    <>
                      <div className="col-md-4">
                        <label className="form-label">Dirección</label>
                        <input className="form-control" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Teléfono</label>
                        <input className="form-control" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
                      </div>
                    </>
                  )}

                  <div className="col-12">
                    <label className="form-label fw-bold">Agregar Productos</label>
                    <div className="card mb-2">
                      <div className="card-body py-2">
                        <div className="row g-2 align-items-end">
                          <div className="col-md-4">
                            <label className="form-label small mb-1">Producto</label>
                            <select className="form-select form-select-sm" value={item.productoId} onChange={(e) => handleSelectProducto(e.target.value)}>
                              <option value="">Seleccione producto...</option>
                              {productos.map(p => (
                                <option key={p._id || p.id} value={p._id || p.id}>{p.nombre}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-2">
                            <label className="form-label small mb-1">Cantidad</label>
                            <input className="form-control form-control-sm" type="number" min="1" value={item.cantidad} onChange={(e) => setItem({ ...item, cantidad: parseInt(e.target.value) || 1 })} />
                          </div>
                          <div className="col-md-2">
                            <label className="form-label small mb-1">Precio</label>
                            <input className="form-control form-control-sm" type="number" value={item.precio} onChange={(e) => setItem({ ...item, precio: parseFloat(e.target.value) || 0 })} />
                          </div>
                          <div className="col-md-3">
                            <button className="btn btn-sm btn-primary w-100" onClick={addItem}>
                              <i className="fas fa-plus"></i> Agregar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {form.items.length > 0 && (
                      <div className="table-responsive">
                        <table className="table table-sm mb-0">
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th>Cantidad</th>
                              <th>Precio</th>
                              <th>Subtotal</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {form.items.map(i => (
                              <tr key={i.id}>
                                <td>{i.nombre}</td>
                                <td>{i.cantidad}</td>
                                <td>{formatPrice(i.precio)}</td>
                                <td>{formatPrice(i.cantidad * i.precio)}</td>
                                <td>
                                  <button className="btn btn-sm btn-outline-danger" onClick={() => removeItem(i.id)}>
                                    <i className="fas fa-times"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="fw-bold">
                              <td colSpan="3" className="text-end">Total:</td>
                              <td>{formatPrice(totalForm)}</td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label">Notas</label>
                    <textarea className="form-control" value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>
                  <i className="fas fa-times me-1"></i>Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={guardarPedido}>
                  <i className="fas fa-save me-1"></i>Crear Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosAdmin;