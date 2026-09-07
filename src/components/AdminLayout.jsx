import React from 'react';
import { Outlet, Link, useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import VentasAdmin from '../pages/ventas/VentasAdmin';
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
import { useModoOscuro } from '../hooks/useModoOscuro';
import { useAdminLayoutMode } from './admin/useAdminLayoutMode';
import { useMeasuredHeight } from '../hooks/useMeasuredHeight';
import AdminSidebarNav from './admin/AdminSidebarNav';
import AdminTopNav from './admin/AdminTopNav';
import AppearanceMenu from './AppearanceMenu';

const AdminHeader = ({ isTopbar, onOrientationChange, navRef }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  const { nombreTienda, logoUrl } = useConfiguracion();
  const { isDark, setThemeMode } = useModoOscuro();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getPageTitle = () => {
    if (location.pathname === '/admin') return 'Dashboard';
    if (location.pathname === '/admin/ventas') return 'Gestión de Ventas';
    if (location.pathname === '/admin/pedidos') return 'Gestión de Pedidos';
    if (location.pathname === '/admin/domicilios') return 'Gestión de Domicilios';
    if (location.pathname === '/admin/pagos') return 'Gestión de Pagos';
    if (location.pathname === '/admin/usuarios') return 'Gestión de Usuarios';
    if (location.pathname === '/admin/usuarios/nuevo') return 'Nuevo Usuario';
    if (location.pathname.startsWith('/admin/usuarios/editar')) return 'Editar Usuario';
    if (location.pathname === '/admin/roles') return 'Gestión de Roles';
    if (location.pathname === '/admin/productos') return 'Inventario';
    if (location.pathname === '/admin/marcas') return 'Inventario';
    if (location.pathname === '/admin/categorias') return 'Inventario';
    // analytics removed from menu
    return 'Gestión';
  };

  return (
    <nav ref={navRef} className="navbar navbar-expand-lg app-navbar fixed-top">
      <div className="container-fluid">
        <Link to="/admin" className="navbar-brand d-flex align-items-center">
          {logoUrl ? (
            <img src={logoUrl} alt={nombreTienda} className="me-2" style={{ height: 24, width: 24, objectFit: 'cover', borderRadius: 6 }} />
          ) : (
            <i className="fas fa-cube me-2"></i>
          )}
          <span className="fw-bold">{nombreTienda}</span>
          <span className="ms-2 badge bg-primary">Admin</span>
        </Link>

        <div className="d-flex align-items-center">
          <span className="me-3 d-none d-md-block">
            <i className="fas fa-user-circle me-1"></i>
            {user?.nombre || user?.email || 'Administrador'}
          </span>
          <AppearanceMenu isDark={isDark} onSetTheme={setThemeMode} isTopbar={isTopbar} onOrientationChange={onOrientationChange} />

          <div className="dropdown">
            <button className="btn btn-outline-theme dropdown-toggle btn-sm" data-bs-toggle="dropdown">
              <i className="fas fa-cog"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><Link to="/admin/usuarios" className="dropdown-item">Usuarios</Link></li>
              <li><Link to="/admin/roles" className="dropdown-item">Roles</Link></li>
              <li><hr className="dropdown-divider" /></li>
              <li><button className="dropdown-item text-danger" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt me-1"></i> Cerrar Sesión
              </button></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

const AdminFooter = () => {
  const { nombreTienda } = useConfiguracion();

  return (
    <footer className="app-admin-footer py-3 px-4">
      <div className="d-flex justify-content-between align-items-center">
        <div className="text-muted small">
          <i className="fas fa-cube me-1"></i> {nombreTienda} - Sistema de Gestión Mercantil
        </div>
        <div className="text-muted small">
          © {new Date().getFullYear()} Todos los derechos reservados
        </div>
      </div>
    </footer>
  );
};

// Layout principal del admin
const AdminLayout = () => {
  const location = useLocation();
  const { isTopbar, isCompact, setOrientation, toggleCompact } = useAdminLayoutMode();
  const [headerRef, headerHeight] = useMeasuredHeight();

  const getPageTitle = () => {
    if (location.pathname === '/admin') return 'Dashboard';
    if (location.pathname === '/admin/ventas') return 'Gestión de Ventas';
    if (location.pathname === '/admin/pedidos') return 'Gestión de Pedidos';
    if (location.pathname === '/admin/domicilios') return 'Gestión de Domicilios';
    if (location.pathname === '/admin/pagos') return 'Gestión de Pagos';
    if (location.pathname === '/admin/usuarios') return 'Gestión de Usuarios';
    if (location.pathname === '/admin/usuarios/nuevo') return 'Nuevo Usuario';
    if (location.pathname.startsWith('/admin/usuarios/editar')) return 'Editar Usuario';
    if (location.pathname === '/admin/roles') return 'Gestión de Roles';
    if (location.pathname === '/admin/roles/nuevo') return 'Nuevo Rol';
    if (location.pathname.startsWith('/admin/roles/editar')) return 'Editar Rol';
    if (location.pathname === '/admin/analytics') return 'Estadísticas y Reportes';
    return 'Administración';
  };

  const routes = (
    <Routes>
            <Route index element={<PrivateRoute module="Ventas"><AdminDashboard /></PrivateRoute>} />

            <Route path="ventas" element={<PrivateRoute module="Ventas"><VentasAdmin /></PrivateRoute>} />
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

      {/* analytics route removed */}
    </Routes>
  );

  return (
    <div>
      <AdminHeader navRef={headerRef} isTopbar={isTopbar} onOrientationChange={setOrientation} />
      <div style={{ paddingTop: headerHeight }}>
        {isTopbar ? (
          <>
            <AdminTopNav compact={isCompact} onToggleCompact={toggleCompact} />
            <div className="admin-main-content p-4">{routes}</div>
          </>
        ) : (
          <div className="d-flex">
            <AdminSidebarNav compact={isCompact} onToggleCompact={toggleCompact} />
            <div className="flex-grow-1 p-4 admin-main-content">{routes}</div>
          </div>
        )}
      </div>
      <AdminFooter />
    </div>
  );
};

export default AdminLayout;