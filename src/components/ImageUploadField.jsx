// src/components/ImageUploadField.jsx
import React, { useRef } from 'react';
import { useImageUpload } from '../hooks/useImageUpload';

// Campo de imagen reutilizable: sube el archivo a Cloudinary y expone la URL resultante.
// Uso con hooks de formulario tipo handleChange(e) -> pasar `name` + `onChange`.
// Uso con un setter directo (ej. un slot de collage) -> pasar `onValueChange(url)`.
const ImageUploadField = ({ label, name, value, onChange, onValueChange, folder = 'general', size = 84 }) => {
  const { upload, uploading, error, setError } = useImageUpload(folder);
  const inputRef = useRef(null);

  const applyValue = (url) => {
    if (onValueChange) onValueChange(url);
    else if (onChange) onChange({ target: { name, value: url, type: 'text' } });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload(file);
    if (result) applyValue(result.url);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = () => {
    setError('');
    applyValue('');
  };

  return (
    <div>
      {label && <label className="form-label">{label}</label>}
      <div className="d-flex align-items-center gap-3">
        {value ? (
          <img
            src={value}
            alt=""
            style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
          />
        ) : (
          <div
            className="text-muted"
            style={{
              width: size,
              height: size,
              borderRadius: 8,
              border: '1px dashed var(--border2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <i className="fas fa-image"></i>
          </div>
        )}
        <div className="flex-grow-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="form-control"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading && <small className="text-muted d-block mt-1"><i className="fas fa-spinner fa-spin me-1"></i>Subiendo imagen...</small>}
          {error && <small className="text-danger d-block mt-1">{error}</small>}
          {value && !uploading && (
            <button type="button" className="btn btn-sm btn-outline-danger mt-2" onClick={handleRemove}>
              <i className="fas fa-times me-1"></i>Quitar imagen
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploadField;
