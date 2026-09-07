import { useNavigate } from 'react-router-dom';
import { useBannerForm } from './hooks/useBannerForm';
import BannerFormFields from './components/BannerFormFields';

const BannerCreate = () => {
  const navigate = useNavigate();
  const { form, errors, setLayout, setImageUrl, setField, setContentType, setContentRefs, productos, marcas, categorias, loading, handleSubmit } = useBannerForm();

  return (
    <div className="container-fluid py-4" style={{ maxWidth: 960 }}>
      <div className="card shadow">
        <div className="card-header bg-success text-white">
          <h2 className="mb-0"><i className="fas fa-plus me-2"></i>Nuevo Banner</h2>
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
                {loading ? 'Creando...' : (<><i className="fas fa-save me-2"></i>Crear Banner</>)}
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

export default BannerCreate;
