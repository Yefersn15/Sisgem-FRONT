// src/pages/roles/hooks/usePermisosPorCategoria.js
import { useMemo } from 'react';

export const usePermisosPorCategoria = (permisosDisponibles) => {
  return useMemo(() => {
    const categorias = {};
    permisosDisponibles.forEach((p) => {
      const [categoria] = p.split('.');
      if (!categorias[categoria]) categorias[categoria] = [];
      categorias[categoria].push(p);
    });
    return categorias;
  }, [permisosDisponibles]);
};
