// src/services/api/banners.api.js
import { request } from './client';

export const getBanners = async () => {
  try {
    const data = await request('/api/banners');
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Error obteniendo banners:', e);
    return [];
  }
};

export const createBanner = async (banner) => {
  const data = await request('/api/banners', { method: 'POST', body: banner });
  return data;
};

export const updateBanner = async (id, banner) => {
  const data = await request(`/api/banners/${id}`, { method: 'PUT', body: banner });
  return data;
};

export const deleteBanner = async (id) => {
  await request(`/api/banners/${id}`, { method: 'DELETE' });
};
