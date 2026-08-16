import { useNavigate } from 'react-router-dom';
import { createCategoria } from './services/categoriasService';
import { useCategoriaForm } from './hooks/useCategoriaForm';
import CategoriaFormFields from './components/CategoriaFormFields';
import { useState } from 'react';

const CategoriaCreate = () => {
  const navigate = useNavigate();
  const { formData, errors, handleChange, validate } = useCategoriaForm({
    nombre: '',
    descripcion: '',
    activo: true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;

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
            <CategoriaFormFields formData={formData} errors={errors} onChange={handleChange} />

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
