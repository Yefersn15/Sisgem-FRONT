// Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const cart = useCart();
  const itemCount = cart?.itemCount || 0;
  const { user, role, hasPermission, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
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

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('theme-dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('theme-dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const handleLinkClick = (to) => {
    closeMenu();
    navigate(to);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
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
    closeMenu();
    navigate(path);
  };

  // Verificar si es administrador
  const isAdmin = role?.nombre === 'ADMIN' || role?.nombre === 'Administrador' || user?.rol_id === 5 || user?.rol === 'ADMIN' || user?.rol === 'Administrador';

  // Definición de los elementos del menú - solo rutas que el usuario puede usar
  const menuSections = [
    {
      title: 'Tienda',
      items: [
        { label: 'Productos', icon: 'fa-box', path: '/productos', module: null },
        { label: 'Carrito', icon: 'fa-shopping-cart', path: '/carrito', module: null }
      ]
    },
    {
      title: 'Administración',
      condition: () => isAdmin || hasPermission('Ventas') || hasPermission('Usuarios') || hasPermission('Configuración') || hasPermission('Reportes') || hasPermission('Inventario') || hasPermission('Productos') || hasPermission('Proveedores'),
      items: isAdmin ? [
        { label: 'Dashboard', icon: 'fa-home', path: '/admin', module: null },
        { label: 'Productos', icon: 'fa-boxes', path: '/admin/productos', module: 'Inventario' },
        { label: 'Marcas', icon: 'fa-tag', path: '/admin/marcas', module: 'Inventario' },
        { label: 'Categorías', icon: 'fa-folder', path: '/admin/categorias', module: 'Inventario' },
        { label: 'Ventas', icon: 'fa-shopping-cart', path: '/admin/ventas', module: 'Ventas' },
        { label: 'Pedidos', icon: 'fa-box', path: '/admin/pedidos', module: 'Ventas' },
        { label: 'Domicilios', icon: 'fa-truck', path: '/admin/domicilios', module: 'Ventas' },
        { label: 'Pagos', icon: 'fa-money-bill-wave', path: '/admin/pagos', module: 'Ventas' },
        { label: 'Proveedores', icon: 'fa-truck-loading', path: '/admin/proveedores', module: 'Proveedores' },
        { label: 'Usuarios', icon: 'fa-users', path: '/admin/usuarios', module: 'Usuarios' },
        { label: 'Roles', icon: 'fa-user-shield', path: '/admin/roles', module: 'Configuración' }
      ] : [
        { label: 'Panel Admin', icon: 'fa-cube', path: '/admin', module: null },
        ...(hasPermission('Inventario') || hasPermission('Productos') ? [
          { label: 'Productos', icon: 'fa-boxes', path: '/admin/productos', module: 'Inventario' },
          { label: 'Marcas', icon: 'fa-tag', path: '/admin/marcas', module: 'Inventario' },
          { label: 'Categorías', icon: 'fa-folder', path: '/admin/categorias', module: 'Inventario' }
        ] : []),
        ...(hasPermission('Ventas') ? [
          { label: 'Ventas', icon: 'fa-shopping-cart', path: '/admin/ventas', module: 'Ventas' },
          { label: 'Pedidos', icon: 'fa-box', path: '/admin/pedidos', module: 'Ventas' },
          { label: 'Domicilios', icon: 'fa-truck', path: '/admin/domicilios', module: 'Ventas' },
          { label: 'Pagos', icon: 'fa-money-bill-wave', path: '/admin/pagos', module: 'Ventas' }
        ] : []),
        ...(hasPermission('Proveedores') ? [
          { label: 'Proveedores', icon: 'fa-truck-loading', path: '/admin/proveedores', module: 'Proveedores' }
        ] : []),
        ...(hasPermission('Usuarios') ? [
          { label: 'Usuarios', icon: 'fa-users', path: '/admin/usuarios', module: 'Usuarios' }
        ] : []),
        ...(hasPermission('Configuración') ? [
          { label: 'Roles', icon: 'fa-user-shield', path: '/admin/roles', module: 'Configuración' }
        ] : [])
      ]
    }
  ];

  // Función para renderizar un item si el usuario tiene permiso
  const renderMenuItem = (item) => {
    if (item.module && !hasPermission(item.module) && !isAdmin) return null;
    return (
      <li key={item.path} className="nav-item">
        <button className="nav-link btn btn-link" onClick={() => handleLinkClick(item.path)}>
          <i className={`fas ${item.icon} me-2`}></i>{item.label}
        </button>
      </li>
    );
  };

  return (
    <>
      <nav className="navbar app-navbar sticky-top w-100">
        <div className="container">
          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleMenu}
            aria-controls="offcanvasNav"
            aria-expanded={menuOpen}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <Link className="navbar-brand ms-2" to="/" onClick={closeMenu}>
            SISGEM
          </Link>

          <div className="ms-3 d-flex align-items-center" style={{ gap: 12, flex: 1 }}>
            <div className="ms-auto d-flex align-items-center">
              {/* Botón de cambio de tema */}
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label="Cambiar tema"
              >
                <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
              </button>

              <Link to="/carrito" className="btn btn-outline-theme position-relative" onClick={closeMenu}>
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
                  <Link to="/login" className="btn btn-outline-theme btn-sm ms-2" onClick={closeMenu}>
                    <i className="fas fa-sign-in-alt me-1"></i>Login
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm ms-2" onClick={closeMenu}>
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Offcanvas controlado por estado */}
      <div className={`offcanvas offcanvas-start ${menuOpen ? 'show' : ''}`} tabIndex="-1" id="offcanvasNav" style={{ visibility: menuOpen ? 'visible' : 'hidden' }}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasNavLabel">Menú</h5>
          <button type="button" className="btn-close" onClick={closeMenu}></button>
        </div>
        <div className="offcanvas-body">
          {menuSections.map((section, idx) => {
            // Verificar condición de la sección (si existe)
            if (section.condition && !section.condition()) return null;
            // Filtrar items visibles según permisos
            const visibleItems = section.items.filter(item => {
              if (item.module && !hasPermission(item.module) && !isAdmin) return false;
              return true;
            });
            if (visibleItems.length === 0) return null;
            return (
              <div key={idx} className="mb-3">
                <h6 className="text-muted text-uppercase small fw-bold">{section.title}</h6>
                <ul className="nav flex-column">
                  {visibleItems.map(renderMenuItem)}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Backdrop */}
      {menuOpen && <div className="offcanvas-backdrop fade show" onClick={closeMenu}></div>}
    </>
  );
};

export default Header;
