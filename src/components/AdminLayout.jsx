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
import RolesList from '../pages/roles/RolesList';
import RoleCreate from '../pages/roles/RoleCreate';
import RoleEdit from '../pages/roles/RoleEdit';
import AdminProductos from '../pages/productos/AdminProductos';
import AdminMarcas from '../pages/marcas/AdminMarcas';
import AdminCategorias from '../pages/categorias/AdminCategorias';
import ProveedoresList from '../pages/proveedores/ProveedoresList';
import ProveedorCreate from '../pages/proveedores/ProveedorCreate';
import ProveedorEdit from '../pages/proveedores/ProveedorEdit';
import ProveedorDetail from '../pages/proveedores/ProveedorDetail';
import PrivateRoute from './PrivateRoute';
import { useAuth } from '../context/AuthContext';

const AdminHeader = () => {
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
    if (location.pathname === '/admin/roles') return 'Gestión de Roles';
    if (location.pathname === '/admin/productos') return 'Inventario';
    if (location.pathname === '/admin/marcas') return 'Inventario';
    if (location.pathname === '/admin/categorias') return 'Inventario';
    if (location.pathname.startsWith('/admin/proveedores')) return 'Proveedores';
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

const AdminSidebar = () => {
  const location = useLocation();
  const { hasPermission } = useAuth();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="app-admin-sidebar p-3" style={{ width: '250px', minHeight: 'calc(100vh - var(--topbar-height) - 50px)' }}>
      <div className="mb-3 d-none d-lg-block">
        <small className="text-muted text-uppercase">Menú Principal</small>
      </div>

      <ul className="nav flex-column">
        <li className="nav-item">
          <Link 
            to="/admin" 
            className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
          >
            <i className="fas fa-home me-2"></i> Dashboard
          </Link>
        </li>

        {/* Inventario - Productos, Marcas, Categorías */}
        {(hasPermission('Inventario') || hasPermission('Productos')) && (
          <>
            <li className="nav-item mt-3">
              <small className="text-muted text-uppercase d-none d-lg-block">Inventario</small>
            </li>
            <li className="nav-item">
              <Link 
                to="/admin/productos" 
                className={`nav-link ${isActive('/admin/productos') ? 'active' : ''}`}
              >
                <i className="fas fa-boxes me-2"></i> Productos
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/admin/marcas" 
                className={`nav-link ${isActive('/admin/marcas') ? 'active' : ''}`}
              >
                <i className="fas fa-tag me-2"></i> Marcas
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/admin/categorias" 
                className={`nav-link ${isActive('/admin/categorias') ? 'active' : ''}`}
              >
                <i className="fas fa-folder me-2"></i> Categorías
              </Link>
            </li>
          </>
        )}

        {hasPermission('Ventas') && (
          <>
            <li className="nav-item mt-3">
              <small className="text-muted text-uppercase d-none d-lg-block">Ventas</small>
            </li>
            <li className="nav-item">
              <Link 
                to="/admin/ventas" 
                className={`nav-link ${isActive('/admin/ventas') ? 'active' : ''}`}
              >
                <i className="fas fa-shopping-cart me-2"></i> Ventas
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/admin/pedidos" 
                className={`nav-link ${isActive('/admin/pedidos') ? 'active' : ''}`}
              >
                <i className="fas fa-box me-2"></i> Pedidos
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/admin/domicilios" 
                className={`nav-link ${isActive('/admin/domicilios') ? 'active' : ''}`}
              >
                <i className="fas fa-truck me-2"></i> Domicilios
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/admin/pagos" 
                className={`nav-link ${isActive('/admin/pagos') ? 'active' : ''}`}
              >
                <i className="fas fa-money-bill-wave me-2"></i> Pagos
              </Link>
            </li>
          </>
        )}

        {/* Proveedores */}
        {hasPermission('Proveedores') && (
          <>
            <li className="nav-item mt-3">
              <small className="text-muted text-uppercase d-none d-lg-block">Proveedores</small>
            </li>
            <li className="nav-item">
              <Link 
                to="/admin/proveedores" 
                className={`nav-link ${isActive('/admin/proveedores') ? 'active' : ''}`}
              >
                <i className="fas fa-truck-loading me-2"></i> Proveedores
              </Link>
            </li>
          </>
        )}

        {hasPermission('Usuarios') && (
          <li className="nav-item mt-3">
            <small className="text-muted text-uppercase d-none d-lg-block">Sistema</small>
          </li>
        )}

        {hasPermission('Usuarios') && (
          <li className="nav-item">
              <Link 
                to="/admin/usuarios" 
                className={`nav-link ${isActive('/admin/usuarios') ? 'active' : ''}`}
              >
              <i className="fas fa-users me-2"></i> Usuarios
            </Link>
          </li>
        )}

        {hasPermission('Configuración') && (
          <li className="nav-item">
              <Link 
                to="/admin/roles" 
                className={`nav-link ${isActive('/admin/roles') ? 'active' : ''}`}
              >
              <i className="fas fa-user-shield me-2"></i> Roles
            </Link>
          </li>
        )}

        {/* Reportes/Analytics removed from admin menu */}
      </ul>

      <hr className="border-secondary my-3" />

      <Link to="/" className="btn btn-outline-theme btn-sm w-100">
        <i className="fas fa-store me-2"></i> Volver a la tienda
      </Link>
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

  const getPageTitle = () => {
    if (location.pathname === '/admin') return 'Dashboard';
    if (location.pathname === '/admin/ventas') return 'Gestión de Ventas';
    if (location.pathname === '/admin/pedidos') return 'Gestión de Pedidos';
    if (location.pathname === '/admin/domicilios') return 'Gestión de Domicilios';
    if (location.pathname === '/admin/pagos') return 'Gestión de Pagos';
    if (location.pathname === '/admin/usuarios') return 'Gestión de Usuarios';
    if (location.pathname === '/admin/roles') return 'Gestión de Roles';
    if (location.pathname === '/admin/roles/nuevo') return 'Nuevo Rol';
    if (location.pathname.startsWith('/admin/roles/editar')) return 'Editar Rol';
    if (location.pathname === '/admin/analytics') return 'Estadísticas y Reportes';
    return 'Administración';
  };

  return (
    <div>
      <AdminHeader />
      <div className="d-flex">
        <AdminSidebar />
        <div className="flex-grow-1 p-4 admin-main-content">
          {/* Admin child routes rendered here (centralizadas) */}
          <Routes>
            <Route index element={<PrivateRoute module="Ventas"><AdminDashboard /></PrivateRoute>} />

            <Route path="ventas" element={<PrivateRoute module="Ventas"><VentasAdmin /></PrivateRoute>} />
            <Route path="productos" element={<PrivateRoute module="Inventario"><AdminProductos /></PrivateRoute>} />
            <Route path="marcas" element={<PrivateRoute module="Inventario"><AdminMarcas /></PrivateRoute>} />
            <Route path="categorias" element={<PrivateRoute module="Inventario"><AdminCategorias /></PrivateRoute>} />
            <Route path="domicilios" element={<PrivateRoute module="Ventas"><AdminDomicilios /></PrivateRoute>} />
            <Route path="pagos" element={<PrivateRoute module="Ventas"><PagosList /></PrivateRoute>} />
            <Route path="pagos/nuevo" element={<PrivateRoute module="Ventas"><PagoCreate /></PrivateRoute>} />
            <Route path="pagos/:id" element={<PrivateRoute module="Ventas"><PagoDetail /></PrivateRoute>} />
            <Route path="pedidos" element={<PrivateRoute module="Ventas"><PedidosAdmin /></PrivateRoute>} />
            <Route path="proveedores" element={<PrivateRoute module="Proveedores"><ProveedoresList /></PrivateRoute>} />
            <Route path="proveedores/nuevo" element={<PrivateRoute module="Proveedores"><ProveedorCreate /></PrivateRoute>} />
            <Route path="proveedores/editar/:id" element={<PrivateRoute module="Proveedores"><ProveedorEdit /></PrivateRoute>} />
            <Route path="proveedores/:id" element={<PrivateRoute module="Proveedores"><ProveedorDetail /></PrivateRoute>} />

            <Route path="usuarios" element={<PrivateRoute module="Usuarios"><UsersList /></PrivateRoute>} />
            <Route path="roles" element={<PrivateRoute module="Configuración"><RolesList /></PrivateRoute>} />
            <Route path="roles/nuevo" element={<PrivateRoute module="Configuración"><RoleCreate /></PrivateRoute>} />
            <Route path="roles/editar/:id" element={<PrivateRoute module="Configuración"><RoleEdit /></PrivateRoute>} />

            {/* analytics route removed */}
          </Routes>
        </div>
      </div>
      <AdminFooter />
    </div>
  );
};

export default AdminLayout;