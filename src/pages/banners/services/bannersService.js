// src/pages/banners/services/bannersService.js
import * as dataService from '../../../services/dataService';

export const getBanners = dataService.getBanners;
export const createBanner = dataService.createBanner;
export const updateBanner = dataService.updateBanner;
export const deleteBanner = dataService.deleteBanner;

export const getBannerById = async (id) => {
  const banners = await dataService.getBanners();
  return banners.find(b => String(b.id) === String(id)) || null;
};
