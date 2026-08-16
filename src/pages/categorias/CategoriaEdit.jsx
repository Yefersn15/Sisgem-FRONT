import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategoriaById, updateCategoria } from './services/categoriasService';
import { useCategoriaForm } from './hooks/useCategoriaForm';
import CategoriaFormFields from './components/CategoriaFormFields';

const CategoriaEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formData, setFormData, errors, handleChange, validate } = useCategoriaForm(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    (async () => {
      const categoria = await getCategoriaById(id);
      if (!categoria) {
        setFetchError('Categoría no encontrada');
        return;
      }
      setFormData(categoria);
    })();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      await updateCategoria(id, formData);
      navigate('/categorias');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetchError) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{fetchError}</div>
        <button className="btn btn-primary" onClick={() => navigate('/categorias')}>Volver</button>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0"><i className="fas fa-edit me-2"></i>Editar Categoría: {formData.nombre}</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <CategoriaFormFields formData={formData} errors={errors} onChange={handleChange} />

            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button type="submit" className="btn btn-primary me-md-2" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>Guardar Cambios
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

export default CategoriaEdit;
