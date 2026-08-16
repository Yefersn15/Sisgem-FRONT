import React from 'react';
import { Outlet, Link, useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import VentasAdmin from '../pages/ventas/VentasAdmin';
import AdminDomicilios from '../pages/domicilios/AdminDomicilios';
import PagosList from '../pages/pagos/PagosList';
import PagoCreate from '../pages/pagos/PagoCreate';
import PagoDetail from '../pages/pagos/PagoDetail';
import PedidosAdmin from '../pages/pedidos/PedidosAdmin';
import UsersList from '../pages/usuarios/UsersList';
import UsuarioEdit from '../pages/usuarios/UsuarioEdit';
import RolesList from '../pages/roles/RolesList';
import RoleCreate from '../pages/roles/RoleCreate';
import RoleEdit from '../pages/roles/RoleEdit';
import AdminProductos from '../pages/productos/AdminProductos';
import AdminMarcas from '../pages/marcas/AdminMarcas';
import AdminCategorias from '../pages/categorias/AdminCategorias';
import AdminBanners from '../pages/banners/AdminBanners';
import BannerCreate from '../pages/banners/BannerCreate';
import BannerEdit from '../pages/banners/BannerEdit';
import PrivateRoute from './PrivateRoute';
import { useAuth } from '../context/AuthContext';
import { useAdminLayoutMode } from '../hooks/useAdminLayoutMode';
import AdminSidebarNav from './admin/AdminSidebarNav';
import AdminTopNav from './admin/AdminTopNav';
import LayoutModeSwitcher from './admin/LayoutModeSwitcher';

const AdminHeader = ({ layoutMode, onLayoutModeChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) document.documentElement.classList.add('theme-dark');
    else document.documentElement.classList.remove('theme-dark');
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
    <nav className="navbar navbar-expand-lg app-navbar sticky-top">
      <div className="container-fluid">
        <Link to="/admin" className="navbar-brand d-flex align-items-center">
          <i className="fas fa-cube me-2"></i>
          <span className="fw-bold">SISGEM</span>
          <span className="ms-2 badge bg-primary">Admin</span>
        </Link>

        <div className="d-flex align-items-center">
          <span className="me-3 d-none d-md-block">
            <i className="fas fa-user-circle me-1"></i>
            {user?.nombre || user?.email || 'Administrador'}
          </span>
          <button
            className="theme-toggle btn btn-link me-2"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            style={{ fontSize: 18 }}
          >
            <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>

          <LayoutModeSwitcher layoutMode={layoutMode} onChange={onLayoutModeChange} />

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
  return (
    <footer className="app-admin-footer py-3 px-4">
      <div className="d-flex justify-content-between align-items-center">
        <div className="text-muted small">
          <i className="fas fa-cube me-1"></i> SISGEM - Sistema de Gestión Mercantil
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
  const { layoutMode, setLayoutMode, isTopbar, isCompact } = useAdminLayoutMode();

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
            <Route path="productos" element={<PrivateRoute module="Inventario"><AdminProductos /></PrivateRoute>} />
            <Route path="marcas" element={<PrivateRoute module="Inventario"><AdminMarcas /></PrivateRoute>} />
            <Route path="categorias" element={<PrivateRoute module="Inventario"><AdminCategorias /></PrivateRoute>} />
            <Route path="banners" element={<PrivateRoute module="Banners"><AdminBanners /></PrivateRoute>} />
            <Route path="banners/nuevo" element={<PrivateRoute module="Banners"><BannerCreate /></PrivateRoute>} />
            <Route path="banners/editar/:id" element={<PrivateRoute module="Banners"><BannerEdit /></PrivateRoute>} />
            <Route path="domicilios" element={<PrivateRoute module="Ventas"><AdminDomicilios /></PrivateRoute>} />
            <Route path="pagos" element={<PrivateRoute module="Ventas"><PagosList /></PrivateRoute>} />
            <Route path="pagos/nuevo" element={<PrivateRoute module="Ventas"><PagoCreate /></PrivateRoute>} />
            <Route path="pagos/:id" element={<PrivateRoute module="Ventas"><PagoDetail /></PrivateRoute>} />
            <Route path="pedidos" element={<PrivateRoute module="Ventas"><PedidosAdmin /></PrivateRoute>} />

            <Route path="usuarios" element={<PrivateRoute module="Usuarios"><UsersList /></PrivateRoute>} />
            <Route path="usuarios/nuevo" element={<PrivateRoute module="Usuarios"><UsuarioEdit /></PrivateRoute>} />
            <Route path="usuarios/editar/:id" element={<PrivateRoute module="Usuarios"><UsuarioEdit /></PrivateRoute>} />
            <Route path="roles" element={<PrivateRoute module="Configuración"><RolesList /></PrivateRoute>} />
            <Route path="roles/nuevo" element={<PrivateRoute module="Configuración"><RoleCreate /></PrivateRoute>} />
            <Route path="roles/editar/:id" element={<PrivateRoute module="Configuración"><RoleEdit /></PrivateRoute>} />

      {/* analytics route removed */}
    </Routes>
  );

  return (
    <div>
      <AdminHeader layoutMode={layoutMode} onLayoutModeChange={setLayoutMode} />
      {isTopbar ? (
        <>
          <AdminTopNav compact={isCompact} />
          <div className="admin-main-content p-4">{routes}</div>
        </>
      ) : (
        <div className="d-flex">
          <AdminSidebarNav compact={isCompact} />
          <div className="flex-grow-1 p-4 admin-main-content">{routes}</div>
        </div>
      )}
      <AdminFooter />
    </div>
  );
};

export default AdminLayout;