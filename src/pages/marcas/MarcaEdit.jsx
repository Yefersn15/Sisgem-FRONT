import { useNavigate, useParams } from 'react-router-dom';
import { useMarcaForm } from './hooks/useMarcaForm';
import MarcaFormFields from './components/MarcaFormFields';

const MarcaEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formData, errors, handleChange, loading, loadingData, fetchError, handleSubmit, logoRef } = useMarcaForm(id);

  if (fetchError) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{fetchError}</div>
        <button className="btn btn-primary" onClick={() => navigate('/marcas')}>Volver</button>
      </div>
    );
  }

  if (loadingData || !formData) {
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
          <h2 className="mb-0"><i className="fas fa-industry me-2"></i>Editar Marca: {formData.nombre}</h2>
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
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>Guardar Cambios
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

export default MarcaEdit;
