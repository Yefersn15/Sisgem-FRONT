import React, { useState } from 'react';
import { Link, useNavigate, Routes, Route } from 'react-router-dom';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import VentasAdmin from '../pages/ventas/VentasAdmin';
import CajaAdmin from '../pages/caja/CajaAdmin';
import DomiciliosAdmin from '../pages/domicilios/DomiciliosAdmin';
import PagosAdmin from '../pages/pagos/PagosAdmin';
import PagoCreate from '../pages/pagos/PagoCreate';
import PagoDetail from '../pages/pagos/PagoDetail';
import PedidosAdmin from '../pages/pedidos/PedidosAdmin';
import UsuariosAdmin from '../pages/usuarios/UsuariosAdmin';
import UsuarioEdit from '../pages/usuarios/UsuarioEdit';
import RolesAdmin from '../pages/roles/RolesAdmin';
import RoleCreate from '../pages/roles/RoleCreate';
import RoleEdit from '../pages/roles/RoleEdit';
import ProductosAdmin from '../pages/productos/ProductosAdmin';
import MarcasAdmin from '../pages/marcas/MarcasAdmin';
import CategoriasAdmin from '../pages/categorias/CategoriasAdmin';
import AdminBanners from '../pages/banners/AdminBanners';
import BannerCreate from '../pages/banners/BannerCreate';
import BannerEdit from '../pages/banners/BannerEdit';
import ConfiguracionAdmin from '../pages/configuracion/ConfiguracionAdmin';
import PrivateRoute from './PrivateRoute';
import { useAuth } from '../context/AuthContext';
import { useConfiguracion } from '../context/ConfiguracionContext';
import { useAdminLayoutMode } from './header/useAdminLayoutMode';
import AdminNavGroups from './header/AdminNavGroups';
import AdminTopBar from './header/AdminTopBar';
import AppearanceMenu from './AppearanceMenu';
import BrandIcon from './BrandIcon';

const AdminFooter = () => {
  const { nombreTienda, direccion, telefono, email } = useConfiguracion();
  const { user } = useAuth();
  const tieneContacto = direccion || telefono || email;

  return (
    <footer className="app-admin-footer py-3 px-4">
      <div className="row gy-2">
        <div className="col-md-4 text-muted small">
          <i className="fas fa-cube me-1"></i> {nombreTienda} — Sistema de Gestión Mercantil
        </div>

        <div className="col-md-4 text-muted small">
          {tieneContacto ? (
            <>
              {direccion && <div><i className="fas fa-map-marker-alt me-1"></i>{direccion}</div>}
              {telefono && <div><i className="fas fa-phone me-1"></i>{telefono}</div>}
              {email && <div><i className="fas fa-envelope me-1"></i>{email}</div>}
            </>
          ) : (
            <Link to="/admin/configuracion" className="text-muted">
              <i className="fas fa-map-marker-alt me-1"></i>Agrega los datos de contacto de tu tienda
            </Link>
          )}
        </div>

        <div className="col-md-4 text-muted small text-md-end">
          <div>
            {user?.nombre && <><i className="fas fa-user me-1"></i>Conectado como {user.nombre}</>}
          </div>
          <div>
            <Link to="/" className="text-muted me-2"><i className="fas fa-external-link-alt me-1"></i>Ver sitio público</Link>
            © {new Date().getFullYear()} Todos los derechos reservados
          </div>
        </div>
      </div>
    </footer>
  );
};

// Layout principal del admin: misma arquitectura que Biblioteca_ReactVite
// (components/AdminLayout.jsx) — una barra superior (AdminTopBar) con un
// único botón de menú móvil que revela el mismo AdminNavGroups sin importar
// la preferencia de escritorio (lateral/superior), en vez de dos componentes
// de menú hechos a mano sin manejo de móvil.
const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { nombreTienda, logoUrl, isDark, setThemeMode } = useConfiguracion();
  const { isTopbar, isCompact, setOrientation, toggleCompact } = useAdminLayoutMode();
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const navigate = useNavigate();
  const esLateral = !isTopbar;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cerrarMenuMovil = () => setMenuMovilAbierto(false);

  const marca = (
    <Link to="/admin" className="app-admin-topbar-link d-flex align-items-center text-decoration-none fw-bold overflow-hidden" style={{ minWidth: 0 }}>
      {logoUrl ? (
        <img src={logoUrl} alt={nombreTienda} height={28} style={{ objectFit: 'contain', borderRadius: 6 }} />
      ) : (
        <BrandIcon size={24} />
      )}
      {!isCompact && <span className="ms-2 text-truncate">{nombreTienda}</span>}
      <span className="ms-2 badge bg-primary">Admin</span>
    </Link>
  );

  const controlesLayout = (
    <AppearanceMenu
      isDark={isDark}
      onSetTheme={setThemeMode}
      isTopbar={isTopbar}
      onOrientationChange={setOrientation}
      isCompact={isCompact}
      onToggleCompact={toggleCompact}
    />
  );

  const menuUsuario = (
    <div className="dropdown">
      <button className="btn btn-outline-theme dropdown-toggle btn-sm d-flex align-items-center" data-bs-toggle="dropdown">
        <i className="fas fa-user-circle me-1"></i>
        <span className="d-none d-sm-inline">{user?.nombre || user?.email || 'Administrador'}</span>
      </button>
      <ul className="dropdown-menu dropdown-menu-end">
        <li><Link className="dropdown-item" to="/perfil"><i className="fas fa-user me-2"></i>Mi Perfil</Link></li>
        <li><Link className="dropdown-item" to="/"><i className="fas fa-globe me-2"></i>Ver sitio público</Link></li>
        <li><hr className="dropdown-divider" /></li>
        <li>
          <button className="dropdown-item text-danger" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
          </button>
        </li>
      </ul>
    </div>
  );

  const botonMenuMovil = (
    <button
      type="button"
      className="btn btn-sm app-admin-topbar-link border-0 d-md-none"
      onClick={() => setMenuMovilAbierto((abierto) => !abierto)}
      aria-label={menuMovilAbierto ? 'Cerrar menú' : 'Abrir menú'}
    >
      <i className={`fas ${menuMovilAbierto ? 'fa-xmark' : 'fa-bars'}`}></i>
    </button>
  );

  // El menú colapsable de móvil es el mismo sin importar la preferencia de
  // escritorio (lateral/superior): en pantallas angostas ninguna de las dos
  // formas de escritorio cabe bien, así que ambas caen a este único patrón.
  const menuMovil = (
    <div className={`d-md-none border-top ${menuMovilAbierto ? '' : 'd-none'}`}>
      <AdminNavGroups variant="mobile" onNavigate={cerrarMenuMovil} />
    </div>
  );

  const routes = (
    <Routes>
      <Route index element={<PrivateRoute module="Ventas"><AdminDashboard /></PrivateRoute>} />

      <Route path="ventas" element={<PrivateRoute module="Ventas"><VentasAdmin /></PrivateRoute>} />
      <Route path="caja" element={<PrivateRoute module="Caja"><CajaAdmin /></PrivateRoute>} />
      <Route path="productos" element={<PrivateRoute module="Inventario"><ProductosAdmin /></PrivateRoute>} />
      <Route path="marcas" element={<PrivateRoute module="Inventario"><MarcasAdmin /></PrivateRoute>} />
      <Route path="categorias" element={<PrivateRoute module="Inventario"><CategoriasAdmin /></PrivateRoute>} />
      <Route path="banners" element={<PrivateRoute module="Banners"><AdminBanners /></PrivateRoute>} />
      <Route path="banners/nuevo" element={<PrivateRoute module="Banners"><BannerCreate /></PrivateRoute>} />
      <Route path="banners/editar/:id" element={<PrivateRoute module="Banners"><BannerEdit /></PrivateRoute>} />
      <Route path="domicilios" element={<PrivateRoute module="Ventas"><DomiciliosAdmin /></PrivateRoute>} />
      <Route path="pagos" element={<PrivateRoute module="Ventas"><PagosAdmin /></PrivateRoute>} />
      <Route path="pagos/nuevo" element={<PrivateRoute module="Ventas"><PagoCreate /></PrivateRoute>} />
      <Route path="pagos/:id" element={<PrivateRoute module="Ventas"><PagoDetail /></PrivateRoute>} />
      <Route path="pedidos" element={<PrivateRoute module="Ventas"><PedidosAdmin /></PrivateRoute>} />

      <Route path="usuarios" element={<PrivateRoute module="Usuarios"><UsuariosAdmin /></PrivateRoute>} />
      <Route path="usuarios/nuevo" element={<PrivateRoute module="Usuarios"><UsuarioEdit /></PrivateRoute>} />
      <Route path="usuarios/editar/:id" element={<PrivateRoute module="Usuarios"><UsuarioEdit /></PrivateRoute>} />
      <Route path="roles" element={<PrivateRoute module="Configuración"><RolesAdmin /></PrivateRoute>} />
      <Route path="roles/nuevo" element={<PrivateRoute module="Configuración"><RoleCreate /></PrivateRoute>} />
      <Route path="roles/editar/:id" element={<PrivateRoute module="Configuración"><RoleEdit /></PrivateRoute>} />
      <Route path="configuracion" element={<PrivateRoute module="Configuración"><ConfiguracionAdmin /></PrivateRoute>} />
    </Routes>
  );

  if (!esLateral) {
    return (
      <div>
        <AdminTopBar
          left={(
            <>
              {botonMenuMovil}
              {marca}
              <div className="d-none d-md-block">
                <AdminNavGroups variant="topbar" compact={isCompact} />
              </div>
            </>
          )}
          right={(
            <>
              {controlesLayout}
              {menuUsuario}
            </>
          )}
          menuMovil={menuMovil}
        />
        <div className="admin-main-content p-3 p-md-4">{routes}</div>
        <AdminFooter />
      </div>
    );
  }

  return (
    <div className="d-md-flex" style={{ minHeight: '100vh' }}>
      <aside className="app-admin-sidebar border-end p-3 d-none d-md-block" style={{ width: isCompact ? 70 : 230, flexShrink: 0, transition: 'width .15s' }}>
        <div className="mb-4">{marca}</div>
        <AdminNavGroups variant="lateral" compact={isCompact} />
      </aside>

      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <AdminTopBar
          left={(
            <>
              {botonMenuMovil}
              <span className="app-admin-topbar-link d-none d-md-inline">Panel de administración</span>
              <div className="d-md-none">{marca}</div>
            </>
          )}
          right={(
            <>
              {controlesLayout}
              {menuUsuario}
            </>
          )}
          menuMovil={menuMovil}
        />
        <div className="admin-main-content p-3 p-md-4 flex-grow-1">{routes}</div>
        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminLayout;