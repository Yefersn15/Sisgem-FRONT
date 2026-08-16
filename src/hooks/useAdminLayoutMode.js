// src/hooks/useAdminLayoutMode.js
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'admin_layout_mode';
const VALID_MODES = ['sidebar-full', 'sidebar-compact', 'topbar-full', 'topbar-compact'];
const DEFAULT_MODE = 'sidebar-full';

export const useAdminLayoutMode = () => {
  const [layoutMode, setLayoutModeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return VALID_MODES.includes(saved) ? saved : DEFAULT_MODE;
    } catch {
      return DEFAULT_MODE;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, layoutMode);
    } catch {
      // almacenamiento no disponible (modo privado, cuota excedida, etc.)
    }
  }, [layoutMode]);

  const setLayoutMode = (mode) => {
    if (VALID_MODES.includes(mode)) setLayoutModeState(mode);
  };

  const isTopbar = layoutMode.startsWith('topbar');
  const isCompact = layoutMode.endsWith('compact');

  return { layoutMode, setLayoutMode, isTopbar, isCompact };
};
