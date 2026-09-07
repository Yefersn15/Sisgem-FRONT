import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useVistaHomeLlamativa } from '../hooks/useVistaHomeLlamativa';

// El sitio público ya no tiene menú lateral ni preferencia de orientación:
// un único navbar (ver Header.jsx) con hamburguesa en móvil, igual que
// Biblioteca_ReactVite.
const Layout = ({ children }) => {
  const { vistaLlamativa, setVistaLlamativa } = useVistaHomeLlamativa();

  return (
    <div>
      <Header vistaLlamativa={vistaLlamativa} setVistaLlamativa={setVistaLlamativa} />
      <main className="app-store-main-content">{React.cloneElement(children, { vistaLlamativa })}</main>
      <Footer />
    </div>
  );
};
export default Layout;
