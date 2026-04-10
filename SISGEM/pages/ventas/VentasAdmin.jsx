import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getVentas, createVenta, updateVenta, formatPrice, exportToExcel, getTotalPagadoByVenta } from '../../services/dataService';
import useDebounce from '../../hooks/useDebounce';

const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Abono'];
const ESTADOS_VENTA = ['pendiente', 'por_validar', 'completada', 'anulada', 'rechazada', 'cancelado'];

const VentasAdmin = () => {
  const [ventas, setVentas] = useState([]);
  const [filterEstado, setFilterEstado] = useState('');
  const [filterMetodo, setFilterMetodo] = useState('');
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [modal, setModal] = useState(null); // null, 'crear', 'editar'
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [form, setForm] = useState({ metodoPago: 'Efectivo', items: [], notas: '', delivery: false, direccion: '', telefono: '' });
  const [item, setItem] = useState({ nombre: '', cantidad: '', precio: '', productoId: '' });

  useEffect(() => {
    cargarVentas();
  }, [debounced, filterEstado, filterMetodo]);

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

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVentas = ventas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(ventas.length / itemsPerPage);

  const getTotalVentas = () => ventas.reduce((sum, v) => sum + (v.total || 0), 0);

  // Funciones para crear/editar ventas
  const handleCreate = () => {
    setForm({ metodoPago: 'Efectivo', items: [], notas: '', delivery: false, direccion: '', telefono: '' });
    setModal('crear');
  };

  const handleEdit = (venta) => {
    setVentaSeleccionada(venta);
    setForm({
      metodoPago: venta.metodoPago,
      items: venta.detalleVenta.map(i => ({ ...i, id: Date.now() })),
      notas: venta.observaciones || '',
      delivery: venta.delivery,
      direccion: venta.direccion || '',
      telefono: venta.telefono || ''
    });
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
    setItem({ nombre: '', cantidad: '', precio: '', productoId: '' });
  };

  const removeItem = (id) => setForm(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));

  const totalForm = form.items.reduce((s, i) => s + (i.cantidad * i.precio), 0);

  const guardarVenta = async () => {
    if (form.items.length === 0) return alert('Agregue al menos un producto');
    try {
      const nueva = await createVenta({
        usuarioId: ventaSeleccionada?.usuarioId || null,
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
    <div>
      {/* Resumen */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 opacity-75">Total Ventas</p>
                  <h3 className="mb-0">{formatPrice(getTotalVentas())}</h3>
                </div>
                <i className="fas fa-dollar-sign fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 opacity-75">Ventas Completadas</p>
                  <h3 className="mb-0">{ventas.filter(v => v.estadoVenta === 'completada').length}</h3>
                </div>
                <i className="fas fa-check-circle fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 opacity-75">Ventas Pendientes</p>
                  <h3 className="mb-0">{ventas.filter(v => v.estadoVenta === 'pendiente' || v.estadoVenta === 'por_validar').length}</h3>
                </div>
                <i className="fas fa-clock fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y acciones */}
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
                <option value="por_validar">Por Validar</option>
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
              <span className="badge bg-secondary fs-6 w-100 py-2">
                {ventas.length} resultados
              </span>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-12">
              <button className="btn btn-primary me-2" onClick={handleCreate}>
                <i className="fas fa-plus me-1"></i>Nueva Venta
              </button>
              <button className="btn btn-outline-secondary" onClick={generarReporte}>
                <i className="fas fa-file-export me-1"></i>Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
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
                      <td>#{venta.id}</td>
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
                            className="btn btn-sm btn-outline-primary"
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
                    <td colSpan="9" className="text-center text-muted py-4">
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
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modal === 'crear' ? 'Nueva Venta' : 'Editar Venta'}</h5>
                <button type="button" className="btn-close" onClick={() => setModal(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {/* Método de pago */}
                  <div className="col-md-4">
                    <label className="form-label">Método de Pago</label>
                    <select className="form-select" value={form.metodoPago} onChange={(e) => setForm({ ...form, metodoPago: e.target.value })}>
                      {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  {/* Delivery */}
                  <div className="col-md-4">
                    <div className="form-check mt-4">
                      <input type="checkbox" className="form-check-input" id="delivery" checked={!!form.delivery} onChange={(e) => setForm({ ...form, delivery: e.target.checked })} />
                      <label className="form-check-label" htmlFor="delivery">Delivery</label>
                    </div>
                  </div>

                  {/* Datos de delivery */}
                  {form.delivery && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label">Dirección</label>
                        <input className="form-control" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Teléfono</label>
                        <input className="form-control" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
                      </div>
                    </>
                  )}

                  {/* Items */}
                  <div className="col-12">
                    <label className="form-label">Productos</label>
                    <div className="card mb-2">
                      <div className="card-body py-2">
                        <div className="row g-2 align-items-end">
                          <div className="col-md-5">
                            <input className="form-control form-control-sm" placeholder="Producto" value={item.nombre} onChange={(e) => setItem({ ...item, nombre: e.target.value })} />
                          </div>
                          <div className="col-md-2">
                            <input className="form-control form-control-sm" type="number" placeholder="Cant" value={item.cantidad} onChange={(e) => setItem({ ...item, cantidad: e.target.value })} />
                          </div>
                          <div className="col-md-2">
                            <input className="form-control form-control-sm" type="number" placeholder="Precio" value={item.precio} onChange={(e) => setItem({ ...item, precio: e.target.value })} />
                          </div>
                          <div className="col-md-2">
                            <button className="btn btn-sm btn-success w-100" onClick={addItem}>
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

                  {/* Notas */}
                  <div className="col-12">
                    <label className="form-label">Notas</label>
                    <textarea className="form-control" value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={modal === 'crear' ? guardarVenta : actualizarVenta}>
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