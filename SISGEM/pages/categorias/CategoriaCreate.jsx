import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCategoria } from '../../services/dataService';

const CategoriaCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    codigoUnico: '',
    activo: true
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
    const codigo = String(formData.codigoUnico || '').trim();
    if (!codigo) newErrors.codigoUnico = 'El código único es obligatorio';
    else if (codigo.length > 50) newErrors.codigoUnico = 'Máximo 50 caracteres';
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
    createCategoria(formData);
    setLoading(false);
    navigate('/categorias');
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-info text-white">
          <h2 className="mb-0"><i className="fas fa-tags me-2"></i>Agregar Nueva Categoría</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Nombre de la Categoría *</label>
                <input
                  type="text"
                  className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                />
                {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Código Único *</label>
                <input
                  type="text"
                  className={`form-control ${errors.codigoUnico ? 'is-invalid' : ''}`}
                  name="codigoUnico"
                  value={formData.codigoUnico}
                  onChange={handleChange}
                />
                {errors.codigoUnico && <div className="invalid-feedback">{errors.codigoUnico}</div>}
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

            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                />
                <label className="form-check-label">Categoría activa</label>
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
                    <i className="fas fa-save me-2"></i>Crear Categoría
                  </>
                )}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/categorias')}>
                <i className="fas fa-times me-2"></i>Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoriaCreate;