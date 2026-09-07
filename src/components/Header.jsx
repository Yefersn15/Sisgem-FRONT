// Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useConfiguracion } from '../context/ConfiguracionContext';
import { getStoreMenuSections } from './store/storeNavConfig';
import AppearanceMenu from './AppearanceMenu';
import BrandIcon from './BrandIcon';

const isActivePath = (pathname, item) =>
  pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to + '/'));
const isSectionActive = (pathname, section) => section.items.some((item) => isActivePath(pathname, item));

// Barra de navegación pública: un único navbar de Bootstrap
// (navbar-expand-lg) que muestra los enlaces en línea desde 992px y los
// colapsa detrás de un botón hamburguesa por debajo de ese ancho — el mismo
// patrón que Biblioteca_ReactVite, sin menú lateral ni preferencia de
// orientación que configurar.
const Header = ({ vistaLlamativa, setVistaLlamativa }) => {
  const cart = useCart();
  const itemCount = cart?.itemCount || 0;
  const { user, logout, hasPermission, isAdmin } = useAuth();
  const { nombreTienda, logoUrl, isDark, setThemeMode, temaResuelto } = useConfiguracion();
  const esOscuro = temaResuelto.encabezadoTexto === '#ffffff';
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const visibleSections = getStoreMenuSections({ isAdmin, hasPermission })
    .filter((section) => !section.condition || section.condition())
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.module || hasPermission(item.module) || isAdmin),
    }))
    .filter((section) => section.items.length > 0);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserMenuClick = (path) => {
    setUserMenuOpen(false);
    navigate(path);
  };

  return (
    <nav className={`navbar navbar-expand-lg app-navbar ${esOscuro ? 'navbar-dark' : 'navbar-light'} sticky-top`}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          {logoUrl ? (
            <img src={logoUrl} alt={nombreTienda} style={{ height: 28, width: 28, objectFit: 'cover', borderRadius: 6 }} />
          ) : (
            <BrandIcon size={24} />
          )}
          {nombreTienda}
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#storeNavMenu"
          aria-controls="storeNavMenu"
          aria-label="Abrir menú"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="storeNavMenu">
          <ul className="navbar-nav me-auto">
            {visibleSections.map((section) => (
              section.flat ? (
                section.items.map((item) => (
                  <li className="nav-item" key={item.to}>
                    <Link to={item.to} className={`nav-link ${isActivePath(location.pathname, item) ? 'active' : ''}`}>
                      <i className={`fas ${item.icon} me-1`}></i>{item.label}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="nav-item dropdown" key={section.key}>
                  <button
                    className={`nav-link dropdown-toggle btn btn-link ${isSectionActive(location.pathname, section) ? 'active' : ''}`}
                    data-bs-toggle="dropdown"
                  >
                    <i className={`fas ${section.icon} me-1`}></i>{section.title}
                  </button>
                  <ul className="dropdown-menu">
                    {section.items.map((item) => (
                      <li key={item.to}>
                        <Link to={item.to} className={`dropdown-item ${isActivePath(location.pathname, item) ? 'active' : ''}`}>
                          <i className={`fas ${item.icon} me-2`}></i>{item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              )
            ))}
            <li className="nav-item">
              <Link className="nav-link" to="/nosotros">Nosotros</Link>
            </li>
          </ul>

          <ul className="navbar-nav align-items-lg-center">
            <li className="nav-item">
              <AppearanceMenu
                isDark={isDark}
                onSetTheme={setThemeMode}
                vistaLlamativa={vistaLlamativa}
                setVistaLlamativa={setVistaLlamativa}
              />
            </li>

            <li className="nav-item">
              <Link to="/carrito" className="nav-link position-relative">
                <i className="fas fa-shopping-cart"></i>
                {itemCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {itemCount}
                  </span>
                )}
              </Link>
            </li>

            {user ? (
              <li className="nav-item dropdown" ref={userMenuRef}>
                <button
                  className="nav-link dropdown-toggle btn btn-link d-flex align-items-center"
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                >
                  {user.fotoPerfil ? (
                    <img
                      src={user.fotoPerfil}
                      alt="Foto"
                      className="rounded-circle me-1"
                      style={{ width: 28, height: 28, objectFit: 'cover' }}
                    />
                  ) : (
                    <i className="fas fa-user-circle me-1"></i>
                  )}
                  {user.nombre}
                </button>
                <ul className={`dropdown-menu dropdown-menu-end ${userMenuOpen ? 'show' : ''}`} style={{ minWidth: 200 }}>
                  <li className="text-center py-2">
                    {user.fotoPerfil ? (
                      <img
                        src={user.fotoPerfil}
                        alt="Foto"
                        className="rounded-circle mb-2"
                        style={{ width: 60, height: 60, objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle mb-2" style={{ width: 60, height: 60 }}>
                        <i className="fas fa-user text-muted fa-2x"></i>
                      </div>
                    )}
                  </li>
                  <li>
                    <div className="px-3 py-2 border-bottom">
                      <small className="text-muted d-block">Documento:</small>
                      <strong>{user.documento || user.id}</strong>
                    </div>
                  </li>
                  <li>
                    <div className="px-3 py-2 border-bottom">
                      <small className="text-muted d-block">Email:</small>
                      <span>{user.email}</span>
                    </div>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={() => handleUserMenuClick('/perfil')}>
                      <i className="fas fa-user me-2"></i>Mi Perfil
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => handleUserMenuClick('/mis-pagos')}>
                      <i className="fas fa-credit-card me-2"></i>Mis Pagos y Abonos
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => handleUserMenuClick('/mis-domicilios')}>
                      <i className="fas fa-truck me-2"></i>Mis Domicilios
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => handleUserMenuClick('/cambiar-password')}>
                      <i className="fas fa-key me-2"></i>Cambiar Contraseña
                    </button>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">
                    <i className="fas fa-sign-in-alt me-1"></i>Login
                  </Link>
                </li>
                <li className="nav-item ms-lg-2">
                  <Link to="/register" className="btn btn-primary btn-sm">
                    Registrarse
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
