import { contrasteTexto } from './color';
import { obtenerPaleta } from './paletas';
import { TEMA_OSCURO_BASE } from './temaOscuro';

// Colores neutros usados cuando no hay tema personalizado ("lienzo en blanco").
const TEMA_NEUTRO = {
  fondo: '#ffffff',
  superficie: '#ffffff',
  encabezado: '#ffffff',
  acento: '#3b82f6',
  secundario: '#6c757d',
};

// Resuelve el `tema` guardado en Configuracion ({modo, paletaId, colores}) +
// el modo oscuro (preferencia del visitante, no se guarda en el sitio) a un
// objeto completo con los 5 colores de marca + su texto legible calculado.
// El modo oscuro reemplaza fondo/superficie/encabezado por una paleta gris
// fija y profesional, pero mantiene el acento/secundario de la paleta de
// marca elegida — así el sitio se ve oscuro sin perder su identidad.
export const resolverTema = (tema, modoOscuro = false) => {
  let base = TEMA_NEUTRO;

  if (tema?.modo === 'PREDEFINIDO' && tema.paletaId) {
    const paleta = obtenerPaleta(tema.paletaId);
    if (paleta) base = paleta;
  } else if (tema?.modo === 'PERSONALIZADO' && tema.colores) {
    base = tema.colores;
  }

  const colores = modoOscuro
    ? { ...base, fondo: TEMA_OSCURO_BASE.fondo, superficie: TEMA_OSCURO_BASE.superficie, encabezado: TEMA_OSCURO_BASE.encabezado }
    : base;

  return {
    fondo: colores.fondo,
    fondoTexto: contrasteTexto(colores.fondo),
    superficie: colores.superficie,
    superficieTexto: contrasteTexto(colores.superficie),
    encabezado: colores.encabezado,
    encabezadoTexto: contrasteTexto(colores.encabezado),
    acento: colores.acento,
    acentoTexto: contrasteTexto(colores.acento),
    secundario: colores.secundario,
    secundarioTexto: contrasteTexto(colores.secundario),
  };
};

// Aplica el tema resuelto como variables CSS en :root, consumidas por App.css.
// --accent/--accent-hover/--accent-dim se mantienen como alias del acento
// (muchas reglas existentes de SISGEM ya dependen de ellas).
export const aplicarTemaCss = (temaResuelto) => {
  const root = document.documentElement.style;
  root.setProperty('--tema-fondo', temaResuelto.fondo);
  root.setProperty('--tema-fondo-texto', temaResuelto.fondoTexto);
  root.setProperty('--tema-superficie', temaResuelto.superficie);
  root.setProperty('--tema-superficie-texto', temaResuelto.superficieTexto);
  root.setProperty('--tema-encabezado', temaResuelto.encabezado);
  root.setProperty('--tema-encabezado-texto', temaResuelto.encabezadoTexto);
  root.setProperty('--tema-acento', temaResuelto.acento);
  root.setProperty('--tema-acento-texto', temaResuelto.acentoTexto);
  root.setProperty('--tema-secundario', temaResuelto.secundario);
  root.setProperty('--tema-secundario-texto', temaResuelto.secundarioTexto);

  const rgb = hexToRgb(temaResuelto.acento);
  root.setProperty('--accent', temaResuelto.acento);
  root.setProperty('--accent-hover', oscurecer(temaResuelto.acento));
  if (rgb) root.setProperty('--accent-dim', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);

  // El navbar/sidebar de admin y de tienda ya se pintan con --header-bg/
  // --header-text (ver App.css): antes eran alias fijos de --surface/
  // --text-primary, ahora siguen al color de "encabezado" de la paleta activa.
  root.setProperty('--header-bg', temaResuelto.encabezado);
  root.setProperty('--header-text', temaResuelto.encabezadoTexto);
};

const hexToRgb = (hex) => {
  const limpio = (hex || '').replace('#', '');
  const valor = limpio.length === 3 ? limpio.split('').map((c) => c + c).join('') : limpio;
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
