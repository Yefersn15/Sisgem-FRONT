// Utilidades de color para calcular texto legible sobre un fondo arbitrario
// (contraste WCAG), sin depender de ninguna librería externa.

const hexARgb = (hex) => {
  const limpio = hex.replace('#', '');
  return {
    r: parseInt(limpio.slice(0, 2), 16),
    g: parseInt(limpio.slice(2, 4), 16),
    b: parseInt(limpio.slice(4, 6), 16),
  };
};

const canalLineal = (canal) => {
  const c = canal / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

export const luminanciaRelativa = ({ r, g, b }) =>
  0.2126 * canalLineal(r) + 0.7152 * canalLineal(g) + 0.0722 * canalLineal(b);

const contraste = (lum1, lum2) => {
  const [claro, oscuro] = lum1 > lum2 ? [lum1, lum2] : [lum2, lum1];
  return (claro + 0.05) / (oscuro + 0.05);
};

// Devuelve '#000000' o '#ffffff', el que tenga mayor contraste contra el fondo dado.
export const contrasteTexto = (hexFondo) => {
  const luminanciaFondo = luminanciaRelativa(hexARgb(hexFondo));
  const contrasteConNegro = contraste(luminanciaFondo, 0);
  const contrasteConBlanco = contraste(luminanciaFondo, 1);
  return contrasteConBlanco > contrasteConNegro ? '#ffffff' : '#000000';
};
