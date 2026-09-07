import { useNavigate } from 'react-router-dom';
import { useMarcaForm } from './hooks/useMarcaForm';
import MarcaFormFields from './components/MarcaFormFields';

const MarcaCreate = () => {
  const navigate = useNavigate();
  const { formData, errors, handleChange, loading, handleSubmit, logoRef } = useMarcaForm();

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-info text-white">
          <h2 className="mb-0"><i className="fas fa-industry me-2"></i>Agregar Nueva Marca</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <MarcaFormFields
              formData={formData}
              errors={errors}
              onChange={handleChange}
              logoRef={logoRef}
            />

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
