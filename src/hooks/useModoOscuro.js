import { useState, useEffect } from 'react';

// Antes duplicado en Header.jsx y AdminLayout.jsx (cada uno con su propia
// copia de la misma lógica de localStorage). Preferencia personal por
// navegador — no tiene relación con la configuración de tienda del admin
// (ver ConfiguracionContext), que sí es la misma para todos los visitantes.
export const useModoOscuro = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) document.documentElement.classList.add('theme-dark');
    else document.documentElement.classList.remove('theme-dark');
  }, []);

  const setThemeMode = (dark) => {
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add('theme-dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('theme-dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return { isDark, setThemeMode };
};
