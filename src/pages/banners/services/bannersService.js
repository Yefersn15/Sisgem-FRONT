// src/pages/banners/services/bannersService.js
import * as bannersApi from '../../../services/api/banners.api';

export const getBanners = bannersApi.getBanners;
export const createBanner = bannersApi.createBanner;
export const updateBanner = bannersApi.updateBanner;
export const deleteBanner = bannersApi.deleteBanner;

export const getBannerById = async (id) => {
  const banners = await bannersApi.getBanners();
  return banners.find(b => String(b.id) === String(id)) || null;
};
