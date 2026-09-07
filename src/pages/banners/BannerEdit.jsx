import { useNavigate, useParams } from 'react-router-dom';
import { useBannerForm } from './hooks/useBannerForm';
import BannerFormFields from './components/BannerFormFields';

const BannerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { form, errors, setLayout, setImageUrl, setField, setContentType, setContentRefs, productos, marcas, categorias, loading, loadingData, fetchError, handleSubmit } = useBannerForm(id);

  if (fetchError) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{fetchError}</div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/banners')}>Volver</button>
      </div>
    );
  }

  if (loadingData || !form) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ maxWidth: 960 }}>
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0"><i className="fas fa-edit me-2"></i>Editar Banner</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <BannerFormFields
              form={form}
              errors={errors}
              setLayout={setLayout}
              setImageUrl={setImageUrl}
              setField={setField}
              setContentType={setContentType}
              setContentRefs={setContentRefs}
              productos={productos}
              marcas={marcas}
              categorias={categorias}
            />

            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button type="submit" className="btn btn-primary me-md-2" disabled={loading}>
                {loading ? 'Guardando...' : (<><i className="fas fa-save me-2"></i>Guardar Cambios</>)}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/banners')}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BannerEdit;
