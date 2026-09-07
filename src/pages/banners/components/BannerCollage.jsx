// src/pages/banners/components/BannerCollage.jsx
import React from 'react';
import { getTemplate, SLOT_LETTERS } from '../hooks/bannerTemplates';
import { formatPrice } from '../../../services/api/utils';

const BannerCollage = ({ layout, images = [], titulo, texto, textPosition = 'none', height = 380 }) => {
  const template = getTemplate(layout);

  return (
    <div
      className="banner-collage"
      style={{
        gridTemplateAreas: template.areas,
        gridTemplateColumns: template.cols,
        gridTemplateRows: template.rows,
        height,
      }}
    >
      {template.slots > 0 && Array.from({ length: template.slots }).map((_, i) => {
        const img = images[i];
        return (
          <div key={i} className="banner-collage-cell" style={{ gridArea: SLOT_LETTERS[i] }}>
            {img?.url ? (
              <img src={img.url} alt={img.nombre || titulo || ''} />
            ) : (
              <div className="banner-collage-placeholder">
                <i className="fas fa-image"></i>
              </div>
            )}
            {(img?.nombre || img?.precio !== undefined) && (
              <div className="banner-collage-item-caption">
                {img.nombre && <span className="banner-collage-item-nombre">{img.nombre}</span>}
                {img.precio !== undefined && img.precio !== null && (
                  <span className="banner-collage-item-precio">{formatPrice(img.precio)}</span>
                )}
              </div>
            )}
          </div>
        );
      })}

      {textPosition !== 'none' && (titulo || texto) && (
        <div className={`banner-collage-text banner-collage-text-${textPosition}`}>
          {titulo && <h3>{titulo}</h3>}
          {texto && <p>{texto}</p>}
        </div>
      )}
    </div>
  );
};

export default BannerCollage;
