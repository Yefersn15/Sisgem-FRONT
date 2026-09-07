import { useEffect } from 'react';
import { useAyuda } from '../context/AyudaContext';

// Cada página llama esto una vez para que el botón de ayuda flotante
// (AyudaContext) muestre su texto. Se registra solo al montar (deps vacías
// a propósito): el contenido es texto fijo por página, no algo que deba
// recalcularse en cada render.
export const useAyudaPagina = (ayuda) => {
  const { setAyudaPagina } = useAyuda();

  useEffect(() => {
    setAyudaPagina(ayuda);
    return () => setAyudaPagina(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- se registra una sola vez al montar la página
  }, []);
};
