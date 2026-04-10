import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMarca, createMarcaAndLinkProveedor, getProveedores } from '../../services/dataService';

const MarcaCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    logoUrl: '',
    sitioWeb: '',
    activo: true
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [selectedProveedor, setSelectedProveedor] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!String(formData.nombre || '').trim()) newErrors.nombre = 'El nombre es obligatorio';
    else if (String(formData.nombre).length > 100) newErrors.nombre = 'Máximo 100 caracteres';
    if (formData.descripcion && String(formData.descripcion).length > 500) newErrors.descripcion = 'Máximo 500 caracteres';
    if (formData.sitioWeb && !/^https?:\/\/.+\..+/.test(String(formData.sitioWeb))) newErrors.sitioWeb = 'URL inválida';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      if (selectedProveedor) {
        createMarcaAndLinkProveedor(formData, selectedProveedor);
      } else {
        createMarca(formData);
      }
    } finally {
      setLoading(false);
    }
    navigate('/marcas');
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-info text-white">
          <h2 className="mb-0"><i className="fas fa-industry me-2"></i>Agregar Nueva Marca</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <div className="col-md-6">
                <label className="form-label">Nombre de la Marca *</label>
                <input
                  type="text"
                  className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                />
                {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <textarea
                className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                name="descripcion"
                rows="3"
                value={formData.descripcion}
                onChange={handleChange}
              ></textarea>
              {errors.descripcion && <div className="invalid-feedback">{errors.descripcion}</div>}
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Logo URL</label>
                <input
                  type="url"
                  className="form-control"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/logo.png"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Sitio Web</label>
                <input
                  type="url"
                  className={`form-control ${errors.sitioWeb ? 'is-invalid' : ''}`}
                  name="sitioWeb"
                  value={formData.sitioWeb}
                  onChange={handleChange}
                  placeholder="https://www.ejemplo.com"
                />
                {errors.sitioWeb && <div className="invalid-feedback">{errors.sitioWeb}</div>}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Proveedor asociado (opcional)</label>
              <select className="form-select" value={selectedProveedor} onChange={(e) => setSelectedProveedor(e.target.value)}>
                <option value="">-- Sin proveedor --</option>
                {proveedores.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                />
                <label className="form-check-label">Marca activa</label>
              </div>
            </div>

            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button type="submit" className="btn btn-primary me-md-2" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>Crear Marca
                  </>
                )}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/marcas')}>
                <i className="fas fa-times me-2"></i>Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MarcaCreate;