// src/pages/ordenes/OrdenDetail.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getOrdenCompraById, getProveedorById, updateOrdenCompra, ESTADOS_ORDEN } from '../../services/dataService';

const fmtCOP = (n) => `COP$ ${(n || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;

const OrdenDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditRoute = location.pathname.includes('/editar');
  
  const [orden, setOrden] = useState(null);
  const [proveedor, setProveedor] = useState(null);
  const [editMode, setEditMode] = useState(isEditRoute);
  const [form, setForm] = useState({});
  const [items, setItems] = useState([]);
  const [anularModal, setAnularModal] = useState(false);
  const [estadoModal, setEstadoModal] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const o = await getOrdenCompraById(id);
        if (!o) {
          alert('Orden no encontrada');
          navigate('/ordenes');
          return;
        }
        setOrden(o);
        setForm({ ...o });
        setItems([...(o.items || [])]);
        
        if (o.proveedorId) {
          const prov = await getProveedorById(o.proveedorId).catch(() => null);
          setProveedor(prov);
        }
      } catch (err) {
        console.error('Error loading orden:', err);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    setEditMode(isEditRoute);
  }, [isEditRoute]);

  const handleSave = () => {
    const total = items.reduce((s, it) => s + (it.subtotal || 0), 0);
    updateOrdenCompra(id, { ...form, items, total });
    setSaved(true);
    setTimeout(() => { setSaved(false); setEditMode(false); loadOrden(); }, 1200);
  };

  const loadOrden = async () => {
    try {
      const o = await getOrdenCompraById(id);
      if (o) {
        setOrden(o);
        setForm({ ...o });
        setItems([...(o.items || [])]);
      }
    } catch (err) {
      console.error('Error loading orden:', err);
    }
  };

  const handleSave = async () => {
    const total = items.reduce((s, it) => s + (it.subtotal || 0), 0);
    await updateOrdenCompra(id, { ...form, items, total });
    setSaved(true);
    setTimeout(() => { setSaved(false); setEditMode(false); loadOrden(); }, 1200);
  };

  const handleAnular = async () => {
    await updateOrdenCompra(id, { estado: 'Anulada', motivoAnulacion: motivo });
    setAnularModal(false);
    setMotivo('');
    loadOrden();
  };

  const handleCambiarEstado = async () => {
    await updateOrdenCompra(id, { estado: nuevoEstado });
    setEstadoModal(false);
    loadOrden();
  };

  const handleAnular = () => {
    updateOrdenCompra(id, { estado: 'Anulada', motivoAnulacion: motivo });
    setAnularModal(false);
    setMotivo('');
    loadOrden();
  };

  const handleCambiarEstado = () => {
    updateOrdenCompra(id, { estado: nuevoEstado });
    setEstadoModal(false);
    loadOrden();
  };

  const updateItem = (i, key, value) => {
    setItems(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: value };
      const cant = parseFloat(next[i].cantidad) || 0;
      const precio = parseFloat(next[i].precioUnitario) || 0;
      next[i].subtotal = +(cant * precio).toFixed(2);
      return next;
    });
  };

  if (!orden) return null;

  const totalEdit = items.reduce((s, it) => s + (it.subtotal || 0), 0);

  const getEstadoBadge = (estado) => {
    const colors = {
      'Pendiente': 'bg-warning',
      'Aprobada': 'bg-info',
      'Enviada': 'bg-primary',
      'Recibida': 'bg-success',
      'Cancelada': 'bg-secondary',
      'Anulada': 'bg-danger'
    };
    return colors[estado] || 'bg-secondary';
  };

  return (
    <div className="container my-4">
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/ordenes')}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div>
          <h2 className="mb-0">{orden.numeroOrden}</h2>
          <span className={`badge ${getEstadoBadge(orden.estado)}`}>{orden.estado}</span>
        </div>
        <div className="ms-auto d-flex gap-2">
          {!editMode ? (
            <>
              {orden.estado !== 'Anulada' && (
                <>
                  <button className="btn btn-outline-primary btn-sm" onClick={() => setEditMode(true)}>
                    <i className="fas fa-edit me-1"></i>Editar
                  </button>
                  <button className="btn btn-outline-primary btn-sm" onClick={() => { setEstadoModal(true); setNuevoEstado(orden.estado); }}>
                    <i className="fas fa-exchange-alt me-1"></i>Estado
                  </button>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => setAnularModal(true)}>
                    <i className="fas fa-times-circle me-1"></i>Anular
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              {saved && <span className="text-success d-flex align-items-center"><i className="fas fa-check-circle me-1"></i> Guardado</span>}
              <button className="btn btn-secondary btn-sm" onClick={() => { setEditMode(false); loadOrden(); }}>Cancelar</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}><i className="fas fa-save me-1"></i>Guardar</button>
            </>
          )}
        </div>
      </div>

      {/* Info card */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <div className="small text-muted text-uppercase fw-bold">Proveedor</div>
              {editMode ? (
                <input className="form-control" value={form.proveedor || ''} onChange={(e) => setForm(prev => ({ ...prev, proveedor: e.target.value }))} />
              ) : (
                <div>{proveedor?.nombre || orden.proveedorId}</div>
              )}
            </div>
            <div className="col-md-4">
              <div className="small text-muted text-uppercase fw-bold">Fecha Creación</div>
              <div>{new Date(orden.fechaCreacion).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <div className="col-md-4">
              <div className="small text-muted text-uppercase fw-bold">Fecha Entrega</div>
              {editMode ? (
                <input type="date" className="form-control" value={form.fechaEntrega || ''} onChange={(e) => setForm(prev => ({ ...prev, fechaEntrega: e.target.value }))} />
              ) : (
                <div>{orden.fechaEntrega || '—'}</div>
              )}
            </div>
          </div>
          
          <div className="mt-3">
            <div className="small text-muted text-uppercase fw-bold">Notas</div>
            {editMode ? (
              <textarea className="form-control" rows="2" value={form.notas || ''} onChange={(e) => setForm(prev => ({ ...prev, notas: e.target.value }))} />
            ) : (
              <div>{orden.notas || '—'}</div>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Detalle de Ítems</h5>
          {editMode && (
            <button className="btn btn-sm btn-outline-primary" onClick={() => setItems(prev => [...prev, { descripcion: '', cantidad: 1, unidad: 'unidad', precioUnitario: 0, subtotal: 0 }])}>
              <i className="fas fa-plus me-1"></i>Agregar
            </button>
          )}
        </div>
        <div className="card-body">
          {/* Encabezados */}
          <div className="row g-2 mb-2 fw-bold text-muted small">
            <div className={editMode ? "col-md-4" : "col-md-5"}>Descripción</div>
            <div className="col-md-2">Cantidad</div>
            <div className="col-md-2">Unidad</div>
            <div className="col-md-2">P. Unitario</div>
            {editMode && <div className="col-md-1"></div>}
            <div className="col-md-1">Subtotal</div>
          </div>

          {items.map((item, i) => (
            editMode ? (
              <div key={i} className="row g-2 mb-2 align-items-center">
                <div className="col-md-4">
                  <input className="form-control" value={item.descripcion} onChange={(e) => updateItem(i, 'descripcion', e.target.value)} />
                </div>
                <div className="col-md-2">
                  <input type="number" className="form-control" min="1" value={item.cantidad} onChange={(e) => updateItem(i, 'cantidad', e.target.value)} />
                </div>
                <div className="col-md-2">
                  <input className="form-control" value={item.unidad} onChange={(e) => updateItem(i, 'unidad', e.target.value)} />
                </div>
                <div className="col-md-2">
                  <input type="number" className="form-control" min="0" step="100" value={item.precioUnitario} onChange={(e) => updateItem(i, 'precioUnitario', e.target.value)} />
                </div>
                <div className="col-md-1">
                  <button className="btn btn-sm btn-outline-danger" disabled={items.length === 1} onClick={() => items.length > 1 && setItems(prev => prev.filter((_, idx) => idx !== i))}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
                <div className="col-md-1 fw-bold text-primary">
                  {fmtCOP(item.subtotal)}
                </div>
              </div>
            ) : (
              <div key={i} className="row g-2 mb-2 border-bottom pb-2">
                <div className="col-md-5">{item.descripcion}</div>
                <div className="col-md-2">{item.cantidad}</div>
                <div className="col-md-2">{item.unidad}</div>
                <div className="col-md-2 font-monospace">{fmtCOP(item.precioUnitario)}</div>
                <div className="col-md-1 fw-bold text-primary font-monospace">{fmtCOP(item.subtotal)}</div>
              </div>
            )
          ))}

          {/* Total */}
          <div className="row mt-3">
            <div className="col-md-10 text-end fw-bold">Total:</div>
            <div className="col-md-2 text-end fw-bold text-primary h4">{fmtCOP(editMode ? totalEdit : orden.total)}</div>
          </div>
        </div>
      </div>

      {/* Modal Anular */}
      {anularModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Anular Orden</h5>
                <button type="button" className="btn-close" onClick={() => { setAnularModal(false); setMotivo(''); }}></button>
              </div>
              <div className="modal-body">
                <p>¿Anular <strong>{orden.numeroOrden}</strong>?</p>
                <div className="mb-3">
                  <label className="form-label">Motivo</label>
                  <textarea className="form-control" rows="3" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo de la anulación..." />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => { setAnularModal(false); setMotivo(''); }}>Cancelar</button>
                <button className="btn btn-outline-danger" onClick={handleAnular}>Anular Orden</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambiar Estado */}
      {estadoModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cambiar Estado</h5>
                <button type="button" className="btn-close" onClick={() => setEstadoModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Selecciona el nuevo estado para <strong>{orden.numeroOrden}</strong></p>
                <div className="mb-3">
                  <label className="form-label">Nuevo Estado</label>
                  <select className="form-select" value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}>
                    {ESTADOS_ORDEN.filter(e => e !== 'Anulada').map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEstadoModal(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleCambiarEstado}>Actualizar Estado</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdenDetail;
