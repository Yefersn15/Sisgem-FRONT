// src/pages/home/components/BannerCarousel.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import BannerCollage from '../../banners/components/BannerCollage';

const BannerCarousel = ({ banners, canManageBanners }) => (
  <>
    {canManageBanners && (
      <div className="d-flex justify-content-end mb-2 px-3">
        <Link to="/admin/banners" className="btn btn-sm btn-outline-primary">
          <i className="fas fa-images me-1"></i>Administrar Banners
        </Link>
      </div>
    )}
    {banners.length > 0 ? (
      <div id="bannerCarousel" className="carousel slide mb-0" data-bs-ride="carousel">
        <div className="carousel-inner">
          {banners.map((ban, idx) => (
            <div key={ban.id} className={`carousel-item ${idx === 0 ? 'active' : ''}`}>
              <BannerCollage
                layout={ban.layout}
                images={ban.images}
                titulo={ban.titulo}
                texto={ban.texto}
                textPosition={ban.textPosition}
                height={380}
              />
            </div>
          ))}
        </div>
        {banners.length > 1 && (
          <>
            <button className="carousel-control-prev" type="button" data-bs-target="#bannerCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Anterior</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#bannerCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Siguiente</span>
            </button>
          </>
        )}
      </div>
    ) : (
      <div className="text-muted mb-0 px-3">No hay banners disponibles.</div>
    )}
  </>
);

export default BannerCarousel;
