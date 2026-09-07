// src/hooks/useLayoutMode.js
import { useState, useEffect } from 'react';

// Preferencia de orientación (lateral/superior) y modo compacto del menú,
// persistida en localStorage bajo un prefijo propio. Antes vivía duplicado
// línea por línea en useAdminLayoutMode.js y useStoreLayoutMode.js — ambos
// son ahora envoltorios delgados de este hook, uno por prefijo de storage.
export const useLayoutMode = (storagePrefix) => {
  const keyOrientation = `${storagePrefix}_layout_orientation`;
  const keyCompact = `${storagePrefix}_layout_compact`;

  const [isTopbar, setIsTopbarState] = useState(() => {
    try {
      return localStorage.getItem(keyOrientation) === 'topbar';
    } catch {
      return false;
    }
  });

  const [isCompact, setIsCompactState] = useState(() => {
    try {
      return localStorage.getItem(keyCompact) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(keyOrientation, isTopbar ? 'topbar' : 'sidebar');
    } catch {
      // almacenamiento no disponible (modo privado, cuota excedida, etc.)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- la clave depende del prefijo, fijo por instancia
  }, [isTopbar]);

  useEffect(() => {
    try {
      localStorage.setItem(keyCompact, String(isCompact));
    } catch {
      // almacenamiento no disponible (modo privado, cuota excedida, etc.)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- la clave depende del prefijo, fijo por instancia
  }, [isCompact]);

  const setOrientation = (orientation) => setIsTopbarState(orientation === 'topbar');
  const toggleCompact = () => setIsCompactState(prev => !prev);

  return { isTopbar, isCompact, setOrientation, toggleCompact };
};
