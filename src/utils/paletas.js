// Catálogo de paletas predefinidas para el selector de tema del sitio.
// Cada paleta define 5 colores de marca:
//   fondo       — tinte pálido del fondo general de la página (el más claro)
//   superficie  — fondo de cards/tablas/formularios (un paso más marcado que fondo)
//   encabezado  — navbar/sidebar/footer (el más oscuro/saturado)
//   acento      — botones primarios, enlaces, elementos destacados
//   secundario  — segundo acento (botones outline, resaltados secundarios)
// El texto legible sobre cada uno se calcula aparte con `contrasteTexto` (ver color.js).
export const PALETAS = [
  { id: 'oceano', nombre: 'Océano', fondo: '#eef5f9', superficie: '#e3eff5', encabezado: '#0b3d5c', acento: '#1f8fce', secundario: '#2ba58c' },
  { id: 'bosque', nombre: 'Bosque', fondo: '#f1f6ee', superficie: '#e6f0e2', encabezado: '#234d35', acento: '#3c9a5c', secundario: '#b5834a' },
  { id: 'atardecer', nombre: 'Atardecer', fondo: '#fdf3ec', superficie: '#fbe9df', encabezado: '#7a3b2e', acento: '#e8703a', secundario: '#8a4a6b' },
  { id: 'grafito', nombre: 'Grafito', fondo: '#f4f4f5', superficie: '#ececed', encabezado: '#212529', acento: '#6c63ff', secundario: '#ec4899' },
  { id: 'lavanda', nombre: 'Lavanda', fondo: '#f7f3fb', superficie: '#f0e9f7', encabezado: '#4a2f6b', acento: '#8a5cd6', secundario: '#d67ab1' },
  { id: 'coral', nombre: 'Coral', fondo: '#fdf1f0', superficie: '#fbe5e3', encabezado: '#7a2c2c', acento: '#ef6f6f', secundario: '#d6a34a' },
  { id: 'menta', nombre: 'Menta', fondo: '#eefaf6', superficie: '#e2f5ee', encabezado: '#0f3d36', acento: '#1fb894', secundario: '#1f6f8f' },
  { id: 'arena', nombre: 'Arena', fondo: '#f8f4ec', superficie: '#f2ead9', encabezado: '#5c4326', acento: '#c8945a', secundario: '#6b7a4a' },
];

export const obtenerPaleta = (id) => PALETAS.find((p) => p.id === id) || null;
