// src/pages/banners/hooks/useBannersAdmin.js
import { useState, useEffect } from 'react';
import { getBanners, deleteBanner, updateBanner } from '../services/bannersService';

export const useBannersAdmin = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarBanners = async () => {
    const data = (await getBanners()) || [];
    setBanners(data);
    setLoading(false);
  };

  useEffect(() => {
    cargarBanners();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este banner?')) return;
    await deleteBanner(id);
    await cargarBanners();
  };

  const handleToggleEstado = async (banner) => {
    await updateBanner(banner.id, { estado: !banner.estado });
    await cargarBanners();
  };

  return { banners, loading, cargarBanners, handleDelete, handleToggleEstado };
};
