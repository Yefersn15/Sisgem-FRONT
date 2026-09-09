import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useVistaHomeLlamativa } from '../hooks/useVistaHomeLlamativa';

// El sitio público ya no tiene menú lateral ni preferencia de orientación:
// un único navbar (ver Header.jsx) con hamburguesa en móvil, igual que
// Biblioteca_ReactVite.
const Layout = ({ children }) => {
  const { vistaLlamativa, setVistaLlamativa } = useVistaHomeLlamativa();
  const location = useLocation();
  // Los carruseles de borde de la vista llamativa son `position: fixed` de
  // borde a borde de la ventana (ver .home-borde-carrusel en
  // styles/vista-llamativa.css), así que quedan por encima de CUALQUIER
  // contenido que no tenga el mismo margen de compensación que Home.jsx se
  // aplica a sí mismo (.home-borde-margen) — incluido el footer, que vive
  // acá afuera de Home y no lo hereda. Solo aplica en "/" porque es la única
  // ruta donde Home.jsx realmente renderiza esos carruseles.
  const llamativaActivaEnInicio = vistaLlamativa && location.pathname === '/';

  return (
    <div>
      <Header vistaLlamativa={vistaLlamativa} setVistaLlamativa={setVistaLlamativa} />
      <main className="app-store-main-content">{React.cloneElement(children, { vistaLlamativa })}</main>
      <div className={llamativaActivaEnInicio ? 'home-borde-margen' : ''}>
        <Footer />
      </div>
    </div>
  );
};
export default Layout;
