// Ícono de marca: una bolsa de compras reducida a formas simples. Usa
// currentColor a propósito, igual que el ícono genérico que reemplaza, para
// heredar el color de texto del encabezado (cambia solo con el tema
// claro/oscuro, sin necesitar variantes).
const BrandIcon = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 96 96" fill="none" className={className} aria-hidden="true">
    <path
      d="M24 34 H72 L68 84 C67.5 87 65 89 62 89 H34 C31 89 28.5 87 28 84 Z"
      fill="currentColor"
    />
    <path
      d="M34 34 V24 C34 14 40 8 48 8 C56 8 62 14 62 24 V34"
      stroke="currentColor"
      strokeWidth="6"
      fill="none"
    />
  </svg>
);

export default BrandIcon;
