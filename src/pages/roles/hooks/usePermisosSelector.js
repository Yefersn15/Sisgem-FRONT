// src/pages/roles/hooks/usePermisosSelector.js
import { useState } from 'react';

export const usePermisosSelector = (initialPermisos = []) => {
  const [permisos, setPermisos] = useState(initialPermisos);

  const togglePermiso = (permiso) => {
    setPermisos((prev) =>
      prev.includes(permiso) ? prev.filter((p) => p !== permiso) : [...prev, permiso]
    );
  };

  const toggleCategoria = (categoriaPermisos) => {
    const allSelected = categoriaPermisos.every((p) => permisos.includes(p));
    setPermisos((prev) =>
      allSelected
        ? prev.filter((p) => !categoriaPermisos.includes(p))
        : [...new Set([...prev, ...categoriaPermisos])]
    );
  };

  return { permisos, setPermisos, togglePermiso, toggleCategoria };
};
