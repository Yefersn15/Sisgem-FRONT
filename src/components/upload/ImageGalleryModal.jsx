// src/components/upload/ImageGalleryModal.jsx
import React, { useState, useEffect } from 'react';
import { listarImagenes } from '../../services/api/upload.api';
import Modal from '../Modal';
import LoadingState from '../LoadingState';

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
    <Modal title="Elegir imagen ya subida" onClose={onClose} maxWidth={760}>
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {loading ? (
          <LoadingState label="Cargando imágenes..." />
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
    </Modal>
  );
};

export default ImageGalleryModal;
