// src/pages/productos/hooks/useProductoReferenceData.js
import { useState, useEffect } from 'react';
import { getMarcas } from '../../marcas/services/marcasService';
import { getCategorias } from '../../categorias/services/categoriasService';
import { getProveedores } from '../../../services/dataService';

export const useProductoReferenceData = () => {
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  useEffect(() => {
    (async () => {
      setMarcas((await getMarcas()) || []);
      setCategorias((await getCategorias()) || []);
      setProveedores((await getProveedores()) || []);
    })();
  }, []);

  return { marcas, setMarcas, categorias, proveedores };
};
