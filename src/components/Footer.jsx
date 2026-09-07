import { Link } from 'react-router-dom';
import { useConfiguracion } from '../context/ConfiguracionContext';

const Footer = () => {
  const { nombreTienda } = useConfiguracion();

  return (
    <footer className="app-footer text-center py-3 mt-4">
      <div className="container d-flex flex-column flex-sm-row justify-content-center align-items-center gap-2">
        <span>&copy; {new Date().getFullYear()} {nombreTienda} - Todos los derechos reservados.</span>
        <Link to="/nosotros" className="ms-sm-2">Nosotros</Link>
      </div>
    </footer>
  );
};
export default Footer;
