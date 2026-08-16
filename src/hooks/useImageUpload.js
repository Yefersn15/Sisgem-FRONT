// src/hooks/useImageUpload.js
import { useState } from 'react';
import { uploadImagen } from '../services/dataService';

const MAX_SIZE_MB = 8;

export const useImageUpload = (folder = 'general', maxWidth) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file) => {
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen');
      return null;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`La imagen no puede superar ${MAX_SIZE_MB}MB`);
      return null;
    }
    setUploading(true);
    try {
      const result = await uploadImagen(file, folder, maxWidth);
      return result;
    } catch (err) {
      setError(err.message || 'Error al subir la imagen');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, error, setError };
};
