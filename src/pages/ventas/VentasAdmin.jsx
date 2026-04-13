import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getVentas, createVenta, updateVenta, formatPrice, exportToExcel, getTotalPagadoByVenta, getUsuarios, getProductos } from '../../services/dataService';
import useDebounce from '../../hooks/useDebounce';

const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Abono'];
const ESTADOS_VENTA = ['pendiente', 'por_validar', 'completada', 'anulada', 'rechazada', 'cancelado'];
const TIPOS_PEDIDO = [
  { value: 'mostrador', label: 'Mostrador' },
  { value: 'domicilio', label: 'Domicilio' }
];

const VentasAdmin = () => {
  const [ventas, setVentas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [filterEstado, setFilterEstado] = useState('');
  const [filterMetodo, setFilterMetodo] = useState('');
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [modal, setModal] = useState(null);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [form, setForm] = useState({ 
    metodoPago: 'Efectivo', 
    items: [], 
    notas: '', 
    delivery: false, 
    direccion: '', 
    telefono: '',
    tipoVenta: 'mostrador',
    usuarioId: '',
    nombreComprador: ''
  });
  const [item, setItem] = useState({ productoId: '', nombre: '', cantidad: 1, precio: 0 });
  const [seleccionarUsuario, setSeleccionarUsuario] = useState(true);

  useEffect(() => {
    cargarVentas();
    cargarUsuarios();
    cargarProductos();
  }, [debounced, filterEstado, filterMetodo]);

  const cargarUsuarios = async () => {
    const lista = await getUsuarios();
    setUsuarios(lista);
  };

  const cargarProductos = async () => {
    try {
      let lista = await getProductos();
      if (!Array.isArray(lista)) lista = lista?.data || lista || [];
      setProductos(lista);
    } catch (e) {
      console.error('Error cargando productos:', e);
      setProductos([]);
    }
  };

  const cargarVentas = async () => {
    let lista = await getVentas();
    if (filterEstado) lista = lista.filter(v => v.estadoVenta === filterEstado);
    if (filterMetodo) lista = lista.filter(v => v.metodoPago === filterMetodo);
    if (debounced) {
      const q = debounced.toLowerCase();
      lista = lista.filter(v => 
        String(v.id).includes(q) ||
        (v.usuarioNombre || '').toLowerCase().includes(q) ||
        (v.telefono || '').includes(q)
      );
    }
    setVentas(lista);
    setCurrentPage(1);
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
      'por_validar': 'bg-info',
      'completada': 'bg-success',
      'anulada': 'bg-danger',
      'rechazada': 'bg-danger',
      'cancelado': 'bg-secondary'
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVentas = ventas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(ventas.length / itemsPerPage);

  const getTotalVentas = () => ventas.reduce((sum, v) => sum + (v.total || 0), 0);

  const handleCreate = () => {
    setForm({ 
      metodoPago: 'Efectivo', 
      items: [], 
      notas: '', 
      delivery: false, 
      direccion: '', 
      telefono: '',
      tipoVenta: 'mostrador',
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

  const handleEdit = (venta) => {
    setVentaSeleccionada(venta);
    setForm({
      metodoPago: venta.metodoPago,
      items: venta.detalleVenta?.map(i => ({ ...i, id: Date.now() })) || [],
      notas: venta.observaciones || '',
      delivery: venta.delivery,
      direccion: venta.direccion || '',
      telefono: venta.telefono || '',
      tipoVenta: venta.tipo_venta === 'domicilio' ? 'domicilio' : 'mostrador',
      usuarioId: venta.usuarioId || '',
      nombreComprador: ''
    });
    setSeleccionarUsuario(true);
    setModal('editar');
  };

  const addItem = () => {
    const cant = parseFloat(item.cantidad);
    const precio = parseFloat(item.precio);
    if (!item.nombre.trim() || isNaN(cant) || cant <= 0 || isNaN(precio) || precio <= 0) return;
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { 
        nombre: item.nombre,
        cantidad: cant,
        precio: precio,
        productoId: item.productoId || null,
        subtotal: cant * precio,
        id: Date.now()
      }]
    }));
    setItem({ productoId: '', nombre: '', cantidad: 1, precio: 0 });
  };

  const removeItem = (id) => setForm(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));

  const totalForm = form.items.reduce((s, i) => s + (i.cantidad * i.precio), 0);

  const guardarVenta = async () => {
    if (form.items.length === 0) return alert('Agregue al menos un producto');
    if (!seleccionarUsuario && !form.nombreComprador.trim()) return alert('Ingrese nombre del comprador');
    if (seleccionarUsuario && !form.usuarioId) return alert('Seleccione un usuario');
    if (form.delivery && !form.direccion.trim()) return alert('Ingrese dirección de entrega');
    if (form.delivery && !form.telefono.trim()) return alert('Ingrese teléfono de contacto');
    
    try {
      const nueva = await createVenta({
        usuarioId: seleccionarUsuario ? form.usuarioId : null,
        nombre_comprador: seleccionarUsuario ? undefined : form.nombreComprador.trim(),
        tipo_venta: form.delivery ? 'domicilio' : 'mostrador',
        metodoPago: form.metodoPago,
        detalleVenta: form.items.map(i => ({
          productoId: i.productoId,
          productoSnapshot: { nombre: i.nombre },
          cantidad: i.cantidad,
          precioUnitario: i.precio,
          subtotal: i.cantidad * i.precio
        })),
        subtotal: totalForm,
        total: totalForm,
        delivery: form.delivery,
        direccion: form.direccion,
        telefono: form.telefono,
        notas: form.notas
      });
      setModal(null);
      cargarVentas();
    } catch (err) {
      alert(err.message || 'Error al guardar venta');
    }
  };

  const actualizarVenta = async () => {
    if (!ventaSeleccionada) return;
    try {
      await updateVenta(ventaSeleccionada.id, {
        metodoPago: form.metodoPago,
        detalleVenta: form.items.map(i => ({
          productoId: i.productoId,
          productoSnapshot: { nombre: i.nombre },
          cantidad: i.cantidad,
          precioUnitario: i.precio,
          subtotal: i.cantidad * i.precio
        })),
        subtotal: totalForm,
        total: totalForm,
        delivery: form.delivery,
        direccion: form.direccion,
        telefono: form.telefono,
        notas: form.notas
      });
      setModal(null);
      cargarVentas();
    } catch (err) {
      alert(err.message || 'Error al actualizar');
    }
  };

  const anularVenta = async (id) => {
    if (!window.confirm('¿Anular esta venta?')) return;
    try {
      await updateVenta(id, { estado_venta: 'cancelado' });
      cargarVentas();
    } catch (err) {
      alert(err.message || 'Error al anular');
    }
  };

  const aprobarVenta = async (id) => {
    try {
      await updateVenta(id, { estado_venta: 'completada' });
      cargarVentas();
    } catch (err) {
      alert(err.message || 'Error al aprobar');
    }
  };

  const generarReporte = () => {
    const data = ventas.map(v => ({
      ID: v.id,
      Fecha: new Date(v.fechaVenta).toLocaleString(),
      Usuario: v.usuarioNombre || '—',
      'Método Pago': v.metodoPago,
      Subtotal: v.subtotal,
      Total: v.total,
      Estado: v.estado,
      Delivery: v.delivery ? 'Sí' : 'No',
      Dirección: v.direccion || '',
      Teléfono: v.telefono || '',
      Notas: v.observaciones || ''
    }));
    exportToExcel(data, 'reporte_ventas.xlsx');
  };

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

      {/* Filtros */}
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
              <button className="btn btn-secondary w-100" onClick={() => { setFilterEstado(''); setFilterMetodo(''); setQuery(''); }}>
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
        
        {/* Paginación */}
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

      {/* Modal Crear/Editar */}
      {(modal === 'crear' || modal === 'editar') && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg m-auto">
            <div className="modal-content">
              <div className="modal-body p-3" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                <button type="button" className="btn-close position-absolute top-0 end-0 m-3" onClick={() => setModal(null)}></button>
                <div className="row g-3">
                  <div className="col-12 mb-3">
                    <label className="form-label fw-bold">¿Quién compra?</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input type="radio" className="form-check-input" id="selUserV" checked={seleccionarUsuario} onChange={() => setSeleccionarUsuario(true)} disabled={modal === 'editar'} />
                        <label className="form-check-label" htmlFor="selUserV">Usuario registrado</label>
                      </div>
                      <div className="form-check">
                        <input type="radio" className="form-check-input" id="selNombreV" checked={!seleccionarUsuario} onChange={() => setSeleccionarUsuario(false)} disabled={modal === 'editar'} />
                        <label className="form-check-label" htmlFor="selNombreV">Solo nombre del comprador</label>
                      </div>
                    </div>
                  </div>

                  {seleccionarUsuario ? (
                    <div className="col-md-6">
                      <label className="form-label">Seleccionar Usuario</label>
                      <select className="form-select" value={form.usuarioId} onChange={(e) => setForm({ ...form, usuarioId: e.target.value })} disabled={modal === 'editar'}>
                        <option value="">Seleccione...</option>
                        {usuarios.map(u => (
                          <option key={u.id} value={u.id}>{u.nombre} {u.apellido} ({u.documento})</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="col-md-6">
                      <label className="form-label">Nombre del Comprador</label>
                      <input className="form-control" value={form.nombreComprador} onChange={(e) => setForm({ ...form, nombreComprador: e.target.value })} placeholder="Nombre completo" disabled={modal === 'editar'} />
                    </div>
                  )}

                  <div className="col-md-3">
                    <label className="form-label">Tipo de Venta</label>
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

                  <div className="col-md-6">
                    <div className="form-check mt-4">
                      <input type="checkbox" className="form-check-input" id="deliveryV" checked={!!form.delivery} onChange={(e) => setForm({ ...form, delivery: e.target.checked, tipoVenta: e.target.checked ? 'domicilio' : 'mostrador' })} />
                      <label className="form-check-label" htmlFor="deliveryV">Requiere Delivery/Domicilio</label>
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
                <button type="button" className="btn btn-primary" onClick={modal === 'crear' ? guardarVenta : actualizarVenta}>
                  <i className="fas fa-save me-1"></i>
                  {modal === 'crear' ? 'Crear' : 'Actualizar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VentasAdmin;