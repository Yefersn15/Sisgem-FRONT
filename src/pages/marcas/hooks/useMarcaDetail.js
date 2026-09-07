// src/pages/marcas/hooks/useMarcaDetail.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMarcaById } from '../services/marcasService';
import { getProductos } from '../../productos/services/productosService';

export const useMarcaDetail = (id) => {
  const navigate = useNavigate();
  const [marca, setMarca] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const marcaData = await getMarcaById(id);
      if (!marcaData) {
        navigate('/admin/marcas');
        return;
      }
      setMarca(marcaData);

      const todosProductos = (await getProductos()) || [];
      const productosMarca = todosProductos.filter((p) =>
        String(p.marcaId) === String(id) || String(p.marca?.id) === String(id)
      );
      setProductos(productosMarca);
      setLoading(false);
    })();
  }, [id, navigate]);

  return { marca, productos, loading };
};
