import { useState, useEffect } from 'react';

// Preferencia personal por navegador (tema claro/oscuro) — no tiene relación
// con la configuración de tienda del admin (ver ConfiguracionContext), que sí
// es la misma para todos los visitantes.
//
// Este hook solo guarda el estado en localStorage: NO toca clases del DOM.
// Se llama una única vez, dentro de ConfiguracionProvider, que es quien
// aplica el efecto visual (clase `.theme-dark` + variables de tema vía
// aplicarTemaCss) y lo reexpone a través de useConfiguracion(). Antes cada
// consumidor (Header, AdminLayout) llamaba a este hook por su cuenta, así
// que cada uno tenía su propia copia de `isDark`: al cambiar el tema desde
// un lugar, el otro no se enteraba hasta recargar la página.
export const useModoOscuro = () => {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const setThemeMode = (dark) => setIsDark(dark);

  return { isDark, setThemeMode };
};
