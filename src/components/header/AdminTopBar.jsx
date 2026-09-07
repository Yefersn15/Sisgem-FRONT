// Barra superior del panel admin: a la izquierda va el botón de menú móvil +
// marca/título (y, en modo "superior", el menú inline); a la derecha, los
// controles (tema, personalizar menú, usuario). `menuMovil` es el menú
// colapsable que aparece debajo en pantallas angostas. Mismo patrón que
// Biblioteca_ReactVite (components/header/TopBar.jsx).
const AdminTopBar = ({ left, right, menuMovil }) => (
  <nav className="app-admin-topbar border-bottom px-3 px-md-4">
    <div className="d-flex align-items-center justify-content-between py-2 gap-2">
      <div className="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">{left}</div>
      <div className="d-flex align-items-center gap-2 flex-shrink-0">{right}</div>
    </div>
    {menuMovil}
  </nav>
);

export default AdminTopBar;
