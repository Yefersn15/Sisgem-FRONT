// Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AppearanceMenu from '../shared/components/common/AppearanceMenu';

const Header = ({ isTopbar, onOrientationChange, navRef }) => {
  const cart = useCart();
  const itemCount = cart?.itemCount || 0;
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Cargar preferencia del tema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('theme-dark');
    } else {
      document.documentElement.classList.remove('theme-dark');
    }
  }, []);

  const setThemeMode = (dark) => {
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add('theme-dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('theme-dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  // Cerrar menú de usuario al hacer click fuera
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
    <nav ref={navRef} className="navbar app-navbar fixed-top w-100">
      <div className="container">
        <Link className="navbar-brand ms-2" to="/">
          SISGEM
        </Link>

        <div className="ms-3 d-flex align-items-center" style={{ gap: 12, flex: 1 }}>
          <div className="ms-auto d-flex align-items-center">
            <AppearanceMenu isDark={isDark} onSetTheme={setThemeMode} isTopbar={isTopbar} onOrientationChange={onOrientationChange} />

            <Link to="/carrito" className="btn btn-outline-theme position-relative">
              <i className="fas fa-shopping-cart"></i>
              {itemCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="dropdown" ref={userMenuRef}>
                <button
                  className="btn btn-outline-theme btn-sm dropdown-toggle d-flex align-items-center ms-2"
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
                  {/* Foto de perfil en el menú */}
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
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-theme btn-sm ms-2">
                  <i className="fas fa-sign-in-alt me-1"></i>Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm ms-2">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
