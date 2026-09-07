// src/pages/home/components/BannerCarousel.jsx
import React from 'react';
import BannerCollage from '../../banners/components/BannerCollage';

// Sin banners activos, el Home simplemente no muestra nada aquí (ni un
// mensaje de "no hay banners" ni un botón de administrarlos) — el hueco
// queda en blanco, como cualquier sección vacía de una tienda real.
const BannerCarousel = ({ banners }) => {
  if (banners.length === 0) return null;

  return (
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
  );
};

export default BannerCarousel;
