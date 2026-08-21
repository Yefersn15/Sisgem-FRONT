// src/services/api/upload.api.js
// Subida de imágenes (Cloudinary), consumido por componentes de subida en src/components/upload.
import { request } from './client';

export const uploadImagen = async (file, folder = 'general', maxWidth) => {
  const formData = new FormData();
  formData.append('imagen', file);
  formData.append('folder', folder);
  if (maxWidth) formData.append('maxWidth', maxWidth);
  return await request('/api/upload', { method: 'POST', body: formData });
};

export const eliminarImagenCloudinary = async (publicId) => {
  await request('/api/upload', { method: 'DELETE', body: { publicId } });
};

export const listarImagenes = async (folder = 'general') => {
  const data = await request(`/api/upload?folder=${encodeURIComponent(folder)}`);
  return Array.isArray(data) ? data : [];
};
