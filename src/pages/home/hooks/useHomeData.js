// src/pages/home/hooks/useHomeData.js
import { useState, useEffect } from 'react';
import { getBanners, getTopProductos } from '../services/homeService';
import { getMarcas } from '../../marcas/services/marcasService';
import { getProductos } from '../../productos/services/productosService';
import { getCategorias } from '../../categorias/services/categoriasService';
import { getVentas } from '../../../services/api/pedidos.api';

export const useHomeData = () => {
  const [banners, setBanners] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [destacados, setDestacados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);

  const reloadAll = async () => {
    const b = (await getBanners()) || [];
    b.sort((a, c) => (a.displayOrder || 0) - (c.displayOrder || 0));
    setBanners(b.filter(x => x.estado !== false));

    const m = (await getMarcas()) || [];
    setMarcas(m.filter(x => x.activo !== false));

    // getTopProductos ya no busca las ventas por su cuenta (ver
    // dashboard.api.js): recibe la lista ya cargada, para no repetir la
    // misma consulta completa cada vez que algo pide el ranking.
    const ventas = (await getVentas()) || [];
    const topVendidos = getTopProductos(ventas, 10);
    const p = (await getProductos()) || [];
    const activos = p.filter(x => x.activo !== false);
    setProductos(activos);

    if (topVendidos.length > 0) {
      const topIds = topVendidos.map(t => t.productoId);
      const topProducts = activos.filter(prod => topIds.includes(prod.id));
      const orderedTop = topIds.map(id => topProducts.find(pr => String(pr.id) === String(id))).filter(Boolean);
      if (orderedTop.length > 0) {
        setDestacados(orderedTop);
      } else {
        activos.sort((a, b2) => new Date(b2.fechaCreacion || 0) - new Date(a.fechaCreacion || 0));
        setDestacados(activos.slice(0, 12));
      }
    } else {
      activos.sort((a, b2) => new Date(b2.fechaCreacion || 0) - new Date(a.fechaCreacion || 0));
      setDestacados(activos.slice(0, 12));
    }

    const cats = (await getCategorias()) || [];
    setCategorias(cats.filter(x => x.activo !== false));
  };

  useEffect(() => {
    reloadAll();
  }, []);

  return { banners, marcas, destacados, categorias, productos };
};
