// src/pages/banners/hooks/useBannersAdmin.js
import { useState, useEffect } from 'react';
import { getBanners, deleteBanner, updateBanner } from '../services/bannersService';
import { useConfirm } from '../../../context/ConfirmContext';

const ITEMS_PER_PAGE = 5;

export const useBannersAdmin = () => {
  const confirm = useConfirm();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const cargarBanners = async () => {
    const data = (await getBanners()) || [];
    setBanners(data);
    setLoading(false);
  };

  useEffect(() => {
    cargarBanners();
  }, []);

  const handleDelete = async (id) => {
    if (!(await confirm('¿Eliminar este banner?'))) return;
    await deleteBanner(id);
    await cargarBanners();
  };

  const handleToggleEstado = async (banner) => {
    await updateBanner(banner.id, { estado: !banner.estado });
    await cargarBanners();
  };

  const totalPages = Math.ceil(banners.length / ITEMS_PER_PAGE);
  const paginatedItems = banners.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return {
    banners,
    paginatedItems,
    currentPage,
    setCurrentPage,
    totalPages,
    loading,
    cargarBanners,
    handleDelete,
    handleToggleEstado,
  };
};
