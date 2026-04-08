// src/pages/proveedores/ProveedorDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProveedorById, toggleProveedorEstado, deleteProveedor, updateProveedor, getMarcasByProveedor, getCatalogoByProveedor } from '../../services/dataService';

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
  const [catalogo, setCatalogo] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const p = await getProveedorById(id);
        if (!p) {
          alert('Proveedor no encontrado');
          navigate('/proveedores');
          return;
        }
        setProveedor(p);
        setForm({ ...p });
        
        // Cargar marcas y catálogo del proveedor
        try {
          const m = await getMarcasByProveedor(id);
          setMarcas(Array.isArray(m) ? m : []);
        } catch (e) {
          setMarcas([]);
        }
        try {
          const c = await getCatalogoByProveedor(id);
          setCatalogo(Array.isArray(c) ? c : []);
        } catch (e) {
          setCatalogo([]);
        }
      } catch (err) {
        console.error('Error cargando proveedor:', err);
        alert('Error al cargar proveedor');
        navigate('/proveedores');
      }
    })();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSave = () => {
    const e = {};
    if (!form.nombre?.trim()) e.nombre = 'Requerido';
    if (!form.documento?.trim()) e.documento = 'Requerido';
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    try {
      updateProveedor(id, form);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setEditMode(false);
        setErrors({});
        const updated = getProveedorById(id);
        setProveedor(updated);
        setForm({ ...updated });
      }, 1200);
    } catch (err) {
      alert(err.message || 'Error actualizando proveedor');
    }
  };

  const handleToggle = () => {
    toggleProveedorEstado(id);
    const updated = getProveedorById(id);
    setProveedor(updated);
    setForm({ ...updated });
  };

  const handleDelete = () => {
    try {
      deleteProveedor(id);
      navigate('/proveedores');
    } catch (err) {
      alert(err.message || 'No se pudo eliminar');
    }
  };

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
        <button className="btn btn-outline-secondary" onClick={() => navigate('/proveedores')}>
          <i className="fas fa-arrow-left"></i>
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
                    <i className="fas fa-edit me-1"></i>Editar
                  </button>
                  <button className="btn btn-outline-warning" onClick={handleToggle}>
                    <i className={`fas fa-toggle-${proveedor.estado ? 'on' : 'off'} me-1`}></i>
                    {proveedor.estado ? 'Desactivar' : 'Activar'}
                  </button>
                  <Link to={`/proveedores/${id}/catalogo`} className="btn btn-outline-primary">
                    <i className="fas fa-book-open me-1"></i>Catálogo
                  </Link>
                  <button className="btn btn-outline-danger" onClick={() => setShowDeleteModal(true)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </>
              ) : (
                <>
                  {saved && <span className="text-success d-flex align-items-center"><i className="fas fa-check-circle me-1"></i> Guardado</span>}
                  <button className="btn btn-secondary" onClick={() => { setEditMode(false); setForm({ ...proveedor }); setErrors({}); }}>Cancelar</button>
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
              <div className="col-md-6 mb-3">
                <label className="form-label">Nombre *</label>
                <input type="text" className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} name="nombre" value={form.nombre || ''} onChange={handleInputChange} />
                {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Tipo Persona</label>
                <select className="form-select" name="tipo_persona" value={form.tipo_persona || ''} onChange={handleInputChange}>
                  <option value="Natural">Natural</option>
                  <option value="Jurídica">Jurídica</option>
                </select>
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Tipo Documento</label>
                <select className="form-select" name="tipo_documento" value={form.tipo_documento || ''} onChange={handleInputChange}>
                  <option value="CC">CC</option>
                  <option value="NIT">NIT</option>
                  <option value="CE">CE</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Documento *</label>
                <input type="text" className={`form-control ${errors.documento ? 'is-invalid' : ''}`} name="documento" value={form.documento || ''} onChange={handleInputChange} />
                {errors.documento && <div className="invalid-feedback">{errors.documento}</div>}
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Contacto</label>
                <input type="text" className="form-control" name="contacto" value={form.contacto || ''} onChange={handleInputChange} />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Rubro</label>
                <input type="text" className="form-control" name="rubro" value={form.rubro || ''} onChange={handleInputChange} />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Código País</label>
                <input type="text" className="form-control" name="telefonoPais" value={form.telefonoPais || ''} onChange={handleInputChange} />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Teléfono</label>
                <input type="text" className="form-control" name="telefono" value={form.telefono || ''} onChange={handleInputChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" name="email" value={form.email || ''} onChange={handleInputChange} />
              </div>
              <div className="col-md-6 mb-3">
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

      {/* Marcas y Catálogo */}
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
            <div className="card-header">
              <h5 className="mb-0">Catálogo ({catalogo.length})</h5>
            </div>
            <div className="card-body">
              {catalogo.length === 0 ? (
                <p className="text-muted">No hay productos en el catálogo</p>
              ) : (
                <p className="mb-0">{catalogo.length} productos en catálogo</p>
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