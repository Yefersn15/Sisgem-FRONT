import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBanner } from './services/bannersService';
import { useBannerForm } from './hooks/useBannerForm';
import BannerFormFields from './components/BannerFormFields';
import { useToast } from '../../context/ToastContext';

const BannerCreate = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { form, errors, setLayout, setImageUrl, setField, validate } = useBannerForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      await createBanner(form);
      navigate('/admin/banners');
    } catch (err) {
      toast.error('Error al crear banner: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

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
