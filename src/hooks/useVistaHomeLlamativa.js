import { useState, useEffect } from 'react';

const STORAGE_KEY = 'home:vistaLlamativa';

// Preferencia de cómo se ve la página de inicio (clásica o llamativa, con
// carruseles en los bordes). Vive en Layout —junto a la orientación del
// menú— porque el control está en el header, visible en todas las páginas
// públicas; Home la recibe como prop desde Rutas.
export const useVistaHomeLlamativa = () => {
  const [vistaLlamativa, setVistaLlamativa] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, vistaLlamativa ? '1' : '0');
    } catch {
      // almacenamiento no disponible (modo privado, cuota excedida, etc.)
    }
  }, [vistaLlamativa]);

  return { vistaLlamativa, setVistaLlamativa };
};
