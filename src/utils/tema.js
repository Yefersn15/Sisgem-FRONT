// Aplica el color de acento configurado por el admin a las variables CSS que
// ya usa toda la app (--accent/--accent-hover/--accent-dim, definidas en
// App.css). No reemplaza el modo claro/oscuro, que sigue siendo una
// preferencia personal por navegador (ver hooks/useModoOscuro.js).
const hexToRgb = (hex) => {
  const limpio = (hex || '').replace('#', '');
  const valor = limpio.length === 3
    ? limpio.split('').map((c) => c + c).join('')
    : limpio;
  const num = parseInt(valor, 16);
  if (Number.isNaN(num) || valor.length !== 6) return null;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
};

const rgbToHex = ({ r, g, b }) => `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;

const oscurecer = (hex, factor = 0.15) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex({ r: rgb.r * (1 - factor), g: rgb.g * (1 - factor), b: rgb.b * (1 - factor) });
};

export const aplicarTemaCss = (colorAcento) => {
  const rgb = hexToRgb(colorAcento);
  if (!rgb) return;
  const root = document.documentElement;
  root.style.setProperty('--accent', colorAcento);
  root.style.setProperty('--accent-hover', oscurecer(colorAcento));
  root.style.setProperty('--accent-dim', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
};

export const restaurarTemaCss = () => {
  const root = document.documentElement;
  root.style.removeProperty('--accent');
  root.style.removeProperty('--accent-hover');
  root.style.removeProperty('--accent-dim');
};
