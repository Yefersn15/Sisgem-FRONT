import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBannerById, updateBanner } from './services/bannersService';
import { useBannerForm } from './hooks/useBannerForm';
import BannerFormFields from './components/BannerFormFields';
import { useToast } from '../../context/ToastContext';

const BannerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { form, setForm, errors, setLayout, setImageUrl, setField, validate } = useBannerForm(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    (async () => {
      const banner = await getBannerById(id);
      if (!banner) {
        setFetchError('Banner no encontrado');
        return;
      }
      setForm({
        layout: banner.layout,
        images: banner.images || [],
        titulo: banner.titulo || '',
        texto: banner.texto || '',
        textPosition: banner.textPosition || 'none',
        displayOrder: banner.displayOrder || 0,
        estado: banner.estado !== false,
      });
    })();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      await updateBanner(id, form);
      navigate('/admin/banners');
    } catch (err) {
      toast.error('Error al actualizar banner: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  if (fetchError) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{fetchError}</div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/banners')}>Volver</button>
      </div>
    );
  }

  if (!form) {
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
