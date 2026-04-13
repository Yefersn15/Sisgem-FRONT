// src/pages/proveedores/ProveedorDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProveedorById, toggleProveedorEstado, deleteProveedor, updateProveedor, getMarcasByProveedor, getProductos } from '../../services/dataService';

const ProveedorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proveedor, setProveedor] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [marcas, setMarcas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validar que el id sea válido
    if (!id || id === 'undefined' || isNaN(parseInt(id))) {
      alert('ID de proveedor no válido');
      navigate('/admin/proveedores');
      return;
    }
    
    const loadData = async () => {
      setLoading(true);
      try {
        const p = await getProveedorById(id);
        if (!p) {
          alert('Proveedor no encontrado');
          navigate('/admin/proveedores');
          return;
        }
        setProveedor(p);
        setForm({ ...p });
        
        // Cargar marcas del proveedor
        try {
          const m = await getMarcasByProveedor(id);
          setMarcas(Array.isArray(m) ? m : []);
        } catch (e) {
          setMarcas([]);
        }
        
        // Cargar productos del proveedor (catálogo)
        try {
          const prods = await getProductos() || [];
          const prodsProveedor = prods.filter(p => String(p.proveedorId) === String(id));
          setProductos(prodsProveedor);
        } catch (e) {
          setProductos([]);
        }
      } catch (err) {
        console.error('Error cargando proveedor:', err);
        alert('Error al cargar proveedor');
        navigate('/admin/proveedores');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSave = async () => {
    const e = {};
    if (!form.nombre?.trim()) e.nombre = 'Requerido';
    if (!form.documento?.trim()) e.documento = 'Requerido';
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    try {
      await updateProveedor(id, form);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setEditMode(false);
        setErrors({});
      }, 1200);
      // Recargar datos
      const updated = await getProveedorById(id);
      setProveedor(updated);
      setForm({ ...updated });
    } catch (err) {
      alert(err.message || 'Error actualizando proveedor');
    }
  };

  const handleToggle = async () => {
    await toggleProveedorEstado(id);
    const updated = await getProveedorById(id);
    setProveedor(updated);
    setForm({ ...updated });
  };

  const handleDelete = async () => {
    await deleteProveedor(id);
    navigate('/admin/proveedores');
  };

  if (loading) return <div className="container my-4">Cargando...</div>;
  if (!proveedor) return null;

  const InfoRow = ({ label, value }) => (
    <div className="mb-3">
      <div className="small text-muted text-uppercase fw-bold">{label}</div>
      <div>{value || '—'}</div>
    </div>
  );

  return (
    <div className="container my-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/admin/proveedores')}>
          <i className="fas fa-arrow-left me-1"></i> Volver
        </button>
        <h2 className="mb-0">Detalle del Proveedor</h2>
      </div>

      {/* Header del proveedor */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <div className="d-flex align-items-center gap-3">
              {proveedor.logoUrl ? (
                <img src={proveedor.logoUrl} alt="logo" style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 8 }} />
              ) : (
                <div style={{ width: 80, height: 80, background: 'var(--surface2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-building fa-2x text-muted"></i>
                </div>
              )}
              <div>
                <h3 className="mb-1">{proveedor.nombre}</h3>
                <div className="text-muted">
                  {proveedor.tipo_persona} · {proveedor.tipo_documento}: {proveedor.documento}
                </div>
                <div className="mt-2">
                  <span className={`badge ${proveedor.estado ? 'bg-success' : 'bg-secondary'}`}>
                    {proveedor.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
            <div className="d-flex gap-2">
              {!editMode ? (
                <>
                  <button className="btn btn-outline-primary" onClick={() => setEditMode(true)}>
                    <i className="fas fa-edit me-1"></i>
                  </button>
                  <button className={`btn btn-outline-${proveedor.estado ? 'warning' : 'success'}`} onClick={handleToggle}>
                    <i className={`fas fa-toggle-${proveedor.estado ? 'off' : 'on'} me-1`}></i>
                    {proveedor.estado ? 'Desactivar' : 'Activar'}
                  </button>
                  <Link to={`/proveedores/${id}/catalogo`} className="btn btn-outline-primary">
                    <i className="fas fa-book-open me-1"></i>Catálogo
                  </Link>
                  {proveedor.estado && (
                    <Link to={`/ordenes/nueva?proveedorId=${id}`} className="btn btn-primary">
                      <i className="fas fa-shopping-cart me-1"></i>Nueva Orden
                    </Link>
                  )}
                  <button className="btn btn-outline-danger" onClick={() => setShowDeleteModal(true)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </>
              ) : (
                <>
                  {saved && <span className="text-success d-flex align-items-center"><i className="fas fa-check-circle me-1"></i> Guardado</span>}
                  <button className="btn btn-secondary" onClick={() => { setEditMode(false); setForm({ ...proveedor }); setErrors({}); }}>
                    <i className="fas fa-times me-1"></i> Cancelar
                  </button>
                  <button className="btn btn-primary" onClick={handleSave}><i className="fas fa-save me-1"></i>Guardar</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Información */}
      <div className="card mb-4">
        <div className="card-body">
          {!editMode ? (
            <div className="row">
              <div className="col-md-6">
                <InfoRow label="Nombre / Razón social" value={proveedor.nombre} />
                <InfoRow label="Tipo Persona" value={proveedor.tipo_persona} />
                <InfoRow label="Documento" value={`${proveedor.tipo_documento} ${proveedor.documento}`} />
                <InfoRow label="Contacto" value={proveedor.contacto} />
              </div>
              <div className="col-md-6">
                <InfoRow label="Teléfono" value={proveedor.telefonoPais ? `${proveedor.telefonoPais} ${proveedor.telefono}` : proveedor.telefono} />
                <InfoRow label="Email" value={proveedor.email} />
                <InfoRow label="Dirección" value={proveedor.direccion} />
                <InfoRow label="Rubro" value={proveedor.rubro} />
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="col-md-2 mb-3">
                <label className="form-label">Tipo Persona</label>
                <select className="form-select" name="tipo_persona" value={form.tipo_persona || ''} onChange={handleInputChange}>
                  <option value="Natural">Natural</option>
                  <option value="Jurídica">Jurídica</option>
                </select>
              </div>
              <div className="col-md-2 mb-3">
                <label className="form-label">Tipo Documento</label>
                <select className="form-select" name="tipo_documento" value={form.tipo_documento || ''} onChange={handleInputChange}>
                  <option value="CC">CC</option>
                  <option value="NIT">NIT</option>
                  <option value="CE">CE</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Documento *</label>
                <input type="text" className={`form-control ${errors.documento ? 'is-invalid' : ''}`} name="documento" value={form.documento || ''} onChange={handleInputChange} />
                {errors.documento && <div className="invalid-feedback">{errors.documento}</div>}
              </div>
              <div className="col-md-5 mb-3">
                <label className="form-label">Nombre / Razón social *</label>
                <input type="text" className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} name="nombre" value={form.nombre || ''} onChange={handleInputChange} />
                {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Contacto</label>
                <input type="text" className="form-control" name="contacto" value={form.contacto || ''} onChange={handleInputChange} />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Rubro</label>
                <input type="text" className="form-control" name="rubro" value={form.rubro || ''} onChange={handleInputChange} />
              </div>
              <div className="col-md-2 mb-3">
                <label className="form-label">Código País</label>
                <input type="text" className="form-control" name="telefonoPais" value={form.telefonoPais || ''} onChange={handleInputChange} />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Teléfono</label>
                <input type="text" className="form-control" name="telefono" value={form.telefono || ''} onChange={handleInputChange} />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" name="email" value={form.email || ''} onChange={handleInputChange} />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Dirección</label>
                <input type="text" className="form-control" name="direccion" value={form.direccion || ''} onChange={handleInputChange} />
              </div>
              <div className="col-md-3 mb-3">
                <div className="form-check mt-4">
                  <input type="checkbox" className="form-check-input" id="estado" name="estado" checked={!!form.estado} onChange={handleInputChange} />
                  <label className="form-check-label" htmlFor="estado">Activo</label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Marcas y Productos del Catálogo */}
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Marcas ({marcas.length})</h5>
            </div>
            <div className="card-body">
              {marcas.length === 0 ? (
                <p className="text-muted">No hay marcas registradas</p>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {marcas.map(m => (
                    <span key={m.id} className="badge bg-primary">{m.nombre}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Catálogo ({productos.length})</h5>
              <Link to={`/proveedores/${id}/catalogo`} className="btn btn-sm btn-outline-primary">
                <i className="fas fa-eye me-1"></i>Ver Catálogo
              </Link>
            </div>
            <div className="card-body">
              {productos.length === 0 ? (
                <p className="text-muted">No hay productos en el catálogo</p>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '200px' }}>
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Stock</th>
                        <th>Precio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.slice(0, 5).map(p => (
                        <tr key={p.id}>
                          <td>{p.nombre}</td>
                          <td>
                            <span className={`badge ${p.stockDisponible > 0 ? 'bg-success' : 'bg-warning'}`}>
                              {p.stockDisponible}
                            </span>
                          </td>
                          <td>${Number(p.precioUnitario || 0).toLocaleString('es-CO')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {productos.length > 5 && (
                    <div className="text-center mt-2">
                      <Link to={`/proveedores/${id}/catalogo`} className="small">
                        Ver los {productos.length} productos en el catálogo →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Eliminar */}
      {showDeleteModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Eliminar Proveedor</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                ¿Confirmas eliminar a <strong>{proveedor.nombre}</strong>? Esta acción no se puede deshacer.
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                <button className="btn btn-outline-danger" onClick={handleDelete}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProveedorDetail;