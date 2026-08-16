import { Link } from 'react-router-dom';
import { useBannersAdmin } from './hooks/useBannersAdmin';
import BannerCollage from './components/BannerCollage';

const AdminBanners = () => {
  const { banners, loading, handleDelete, handleToggleEstado } = useBannersAdmin();

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Gestión de Banners</h2>
          <p className="text-muted mb-0">Administra los banners de la página principal</p>
        </div>
        <Link to="/admin/banners/nuevo" className="btn btn-primary">
          <i className="fas fa-plus me-1"></i>Nuevo Banner
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status"></div>
        </div>
      ) : banners.length === 0 ? (
        <div className="alert alert-info text-center">No hay banners creados todavía.</div>
      ) : (
        <div className="row g-4">
          {banners.map(banner => (
            <div className="col-md-6" key={banner.id}>
              <div className="card h-100">
                <div className="card-body">
                  <BannerCollage
                    layout={banner.layout}
                    images={banner.images}
                    titulo={banner.titulo}
                    texto={banner.texto}
                    textPosition={banner.textPosition}
                    height={200}
                  />
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      <strong>{banner.titulo || 'Sin título'}</strong>
                      <div>
                        <span className={`badge ${banner.estado ? 'bg-success' : 'bg-secondary'}`}>
                          {banner.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                    <div className="d-flex gap-1">
                      <button
                        className={`btn btn-sm ${banner.estado ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        onClick={() => handleToggleEstado(banner)}
                        title={banner.estado ? 'Desactivar' : 'Activar'}
                      >
                        <i className={`fas fa-toggle-${banner.estado ? 'off' : 'on'}`}></i>
                      </button>
                      <Link to={`/admin/banners/editar/${banner.id}`} className="btn btn-sm btn-outline-primary" title="Editar">
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(banner.id)}
                        title="Eliminar"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
