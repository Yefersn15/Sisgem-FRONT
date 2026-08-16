// src/components/ImageGalleryModal.jsx
import React, { useState, useEffect } from 'react';
import { listarImagenes } from '../services/dataService';

const ImageGalleryModal = ({ folder, onSelect, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await listarImagenes(folder);
        setImages(data);
      } catch (err) {
        setError(err.message || 'Error al cargar las imágenes');
      } finally {
        setLoading(false);
      }
    })();
  }, [folder]);

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Elegir imagen ya subida</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status"></div>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : images.length === 0 ? (
              <div className="alert alert-info text-center">
                Todavía no has subido imágenes en esta categoría.
              </div>
            ) : (
              <div className="row g-2">
                {images.map(img => (
                  <div className="col-4 col-md-3" key={img.publicId}>
                    <button
                      type="button"
                      className="btn p-0 border-0 w-100"
                      onClick={() => onSelect(img)}
                      title="Usar esta imagen"
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-100"
                        style={{ height: 90, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGalleryModal;
