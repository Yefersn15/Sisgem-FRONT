// src/pages/productos/hooks/useProductoReferenceData.js
import { useState, useEffect } from 'react';
import { getMarcas } from '../../marcas/services/marcasService';
import { getCategorias } from '../../categorias/services/categoriasService';

export const useProductoReferenceData = () => {
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    (async () => {
      setMarcas((await getMarcas()) || []);
      setCategorias((await getCategorias()) || []);
    })();
  }, []);

  return { marcas, setMarcas, categorias };
};
