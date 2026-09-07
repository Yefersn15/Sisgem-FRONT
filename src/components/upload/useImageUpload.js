// src/components/upload/useImageUpload.js
import { useState } from 'react';
import { uploadImagen } from '../../services/api/upload.api';

const MAX_SIZE_MB = 8;

export const validarArchivoImagen = (file) => {
  if (!file.type.startsWith('image/')) return 'El archivo debe ser una imagen';
  if (file.size > MAX_SIZE_MB * 1024 * 1024) return `La imagen no puede superar ${MAX_SIZE_MB}MB`;
  return '';
};

export const useImageUpload = (folder = 'general', maxWidth) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file) => {
    setError('');
    const mensajeInvalido = validarArchivoImagen(file);
    if (mensajeInvalido) {
      setError(mensajeInvalido);
      return null;
    }
    setUploading(true);
    try {
      return await uploadImagen(file, folder, maxWidth);
    } catch (err) {
      setError(err.message || 'Error al subir la imagen');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, error, setError };
};

// Resuelve una imagen pendiente contra el ref expuesto por ImageUploadField
// (ver su `resolverPendiente`): si no hay archivo pendiente, o si la subida
// falla, cae de vuelta en los valores actuales — así cada formulario no
// tiene que repetir el `resuelto?.changed ? resuelto.url : form.logoUrl` a
// mano cada vez. Devuelve `{ ok: false }` solo cuando la subida se intentó y
// falló (el caller debe abortar el guardado); en cualquier otro caso,
// `ok: true` con la url que corresponde usar en el payload.
export const resolverImagenPendiente = async (ref, actual = '') => {
  const resuelto = await ref?.current?.resolverPendiente();
  if (resuelto?.ok === false) return { ok: false };
  if (resuelto?.changed) return { ok: true, url: resuelto.url };
  return { ok: true, url: actual || '' };
};
