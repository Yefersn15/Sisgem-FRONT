// src/pages/banners/hooks/bannerTemplates.js
// Plantillas fijas de collage. `areas` usa grid-template-areas con letras a, b, c...
// asignadas en orden a cada casilla de imagen (slot 0 = a, slot 1 = b, ...).
export const BANNER_TEMPLATES = [
  {
    key: 'single',
    label: 'Imagen única',
    slots: 1,
    areas: '"a"',
    cols: '1fr',
    rows: '1fr',
  },
  {
    key: 'duo',
    label: 'Dos imágenes',
    slots: 2,
    areas: '"a b"',
    cols: '1fr 1fr',
    rows: '1fr',
  },
  {
    key: 'trio',
    label: 'Una grande + dos',
    slots: 3,
    areas: '"a b" "a c"',
    cols: '1.4fr 1fr',
    rows: '1fr 1fr',
  },
  {
    key: 'grid-4',
    label: 'Cuadrícula 2x2',
    slots: 4,
    areas: '"a b" "c d"',
    cols: '1fr 1fr',
    rows: '1fr 1fr',
  },
  {
    key: 'grid-6',
    label: 'Cuadrícula 3x2',
    slots: 6,
    areas: '"a b c" "d e f"',
    cols: '1fr 1fr 1fr',
    rows: '1fr 1fr',
  },
  {
    key: 'mosaic-8',
    label: 'Mosaico 4x2',
    slots: 8,
    areas: '"a b c d" "e f g h"',
    cols: '1fr 1fr 1fr 1fr',
    rows: '1fr 1fr',
  },
];

export const SLOT_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export const getTemplate = (key) => BANNER_TEMPLATES.find(t => t.key === key) || BANNER_TEMPLATES[0];
