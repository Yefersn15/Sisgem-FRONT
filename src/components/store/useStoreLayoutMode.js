// src/components/store/useStoreLayoutMode.js
import { useState, useEffect } from 'react';

const STORAGE_KEY_ORIENTATION = 'store_layout_orientation';
const STORAGE_KEY_COMPACT = 'store_layout_compact';

export const useStoreLayoutMode = () => {
  const [isTopbar, setIsTopbarState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_ORIENTATION) === 'topbar';
    } catch {
      return false;
    }
  });

  const [isCompact, setIsCompactState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_COMPACT) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ORIENTATION, isTopbar ? 'topbar' : 'sidebar');
    } catch {
      // almacenamiento no disponible (modo privado, cuota excedida, etc.)
    }
  }, [isTopbar]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMPACT, String(isCompact));
    } catch {
      // almacenamiento no disponible (modo privado, cuota excedida, etc.)
    }
  }, [isCompact]);

  const setOrientation = (orientation) => setIsTopbarState(orientation === 'topbar');
  const toggleCompact = () => setIsCompactState(prev => !prev);

  return { isTopbar, isCompact, setOrientation, toggleCompact };
};
