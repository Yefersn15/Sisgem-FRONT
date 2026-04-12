import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/home/Home';
import ProductosList from '../pages/productos/ProductosList';
import ProductoCreate from '../pages/productos/ProductoCreate';
import ProductoEdit from '../pages/productos/ProductoEdit';
import ProductosPorCategoria from '../pages/productos/ProductosPorCategoria';
import ProductosPorMarca from '../pages/productos/ProductosPorMarca';
import MarcaCreate from '../pages/marcas/MarcaCreate';
import MarcaEdit from '../pages/marcas/MarcaEdit';
import CategoriaCreate from '../pages/categorias/CategoriaCreate';
import CategoriaEdit from '../pages/categorias/CategoriaEdit';
import Cart from '../pages/carrito/Cart';
import Checkout from '../pages/carrito/Checkout';
import MisPedidos from '../pages/pedidos/MisPedidos';
import VentaDetails from '../pages/ventas/VentaDetails';
import AdminDomicilios from '../pages/domicilios/AdminDomicilios';
import OrdenesList from '../pages/ordenes/OrdenesList';
import OrdenCreate from '../pages/ordenes/OrdenCreate';
import OrdenDetail from '../pages/ordenes/OrdenDetail';
import CatalogoProveedorList from '../pages/catalogo/CatalogoProveedorList';
import CatalogoCreate from '../pages/catalogo/CatalogoCreate';
import CatalogoEdit from '../pages/catalogo/CatalogoEdit';
import OrdenCompraDraft from '../pages/ordenes/OrdenCompraDraft';

// Admin
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import VentasAdmin from '../pages/ventas/VentasAdmin';
import PedidosAdmin from '../pages/pedidos/PedidosAdmin';
import PagosList from '../pages/pagos/PagosList';
import PagoCreate from '../pages/pagos/PagoCreate';
import PagoDetail from '../pages/pagos/PagoDetail';
import MisPagos from '../pages/pagos/MisPagos';
import UsersList from '../pages/usuarios/UsersList';
import RolesList from '../pages/roles/RolesList';
import RoleCreate from '../pages/roles/RoleCreate';
import RoleEdit from '../pages/roles/RoleEdit';
import AdminCategorias from '../pages/categorias/AdminCategorias';
import AdminMarcas from '../pages/marcas/AdminMarcas';
import AdminProductos from '../pages/productos/AdminProductos';



// Auth
import Login from '../pages/auth/Login';
import Register from '../pages/usuarios/Register';
import Perfil from '../pages/usuarios/Perfil';
import CambiarPassword from '../pages/usuarios/CambiarPassword';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Protected Route
import PrivateRoute from './PrivateRoute';

const Rutas = () => {
  return (
    <Routes>
      {/* === PÚBLICAS: Home / Tienda === */}
      <Route path="/" element={<Home />} />
      
      {/* === PRODUCTOS === */}
      <Route path="/productos" element={<ProductosList />} />
      <Route path="/productos/nuevo" element={<PrivateRoute module="Productos"><ProductoCreate /></PrivateRoute>} />
      <Route path="/productos/editar/:id" element={<PrivateRoute module="Productos"><ProductoEdit /></PrivateRoute>} />
      <Route path="/productos/por-categoria/:id" element={<ProductosPorCategoria />} />
      <Route path="/productos/por-marca/:id" element={<ProductosPorMarca />} />

      {/* === MARCAS === */}
      <Route path="/marcas" element={<Navigate to="/productos" replace />} />
      <Route path="/marcas/nueva" element={<PrivateRoute module="Marcas"><MarcaCreate /></PrivateRoute>} />
      <Route path="/marcas/editar/:id" element={<PrivateRoute module="Marcas"><MarcaEdit /></PrivateRoute>} />

      {/* === CATEGORÍAS === */}
      <Route path="/categorias" element={<Navigate to="/productos" replace />} />
      <Route path="/categorias/nueva" element={<PrivateRoute module="Categorías"><CategoriaCreate /></PrivateRoute>} />
      <Route path="/categorias/editar/:id" element={<PrivateRoute module="Categorías"><CategoriaEdit /></PrivateRoute>} />

      {/* === PROVEEDORES - ahora en /admin/proveedores === */}

      {/* === ÓRDENES DE COMPRA === */}
      <Route path="/ordenes" element={<PrivateRoute module="Compras"><OrdenesList /></PrivateRoute>} />
      <Route path="/ordenes/nueva" element={<PrivateRoute module="Compras"><OrdenCreate /></PrivateRoute>} />
      <Route path="/ordenes/:id" element={<PrivateRoute module="Compras"><OrdenDetail /></PrivateRoute>} />
      <Route path="/ordenes/:id/editar" element={<PrivateRoute module="Compras"><OrdenDetail /></PrivateRoute>} />

      {/* === CATÁLOGO DE PROVEEDORES === */}
      <Route path="/proveedores/:id/catalogo" element={<PrivateRoute module="Proveedores"><CatalogoProveedorList /></PrivateRoute>} />
      <Route path="/proveedores/:id/catalogo/nuevo" element={<PrivateRoute module="Proveedores"><CatalogoCreate /></PrivateRoute>} />
      <Route path="/proveedores/:id/orden" element={<PrivateRoute module="Proveedores"><OrdenCompraDraft /></PrivateRoute>} />
      <Route path="/catalogo/editar/:id" element={<PrivateRoute module="Proveedores"><CatalogoEdit /></PrivateRoute>} />

      {/* === CARRITO Y TIENDA === */}
      <Route path="/carrito" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/ventas" element={<PrivateRoute><MisPagos /></PrivateRoute>} />
      <Route path="/ventas/:id" element={<VentaDetails />} />
      <Route path="/pedidos/:id" element={<VentaDetails />} />
      <Route path="/mis-pagos" element={<PrivateRoute><MisPagos /></PrivateRoute>} />

      {/* === RUTAS DEL ADMIN === */}
      <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/ventas" element={<PrivateRoute module="Ventas"><VentasAdmin /></PrivateRoute>} />
      <Route path="/admin/pedidos" element={<PrivateRoute module="Ventas"><PedidosAdmin /></PrivateRoute>} />
      <Route path="/admin/domicilios" element={<PrivateRoute module="Ventas"><AdminDomicilios /></PrivateRoute>} />
      <Route path="/admin/pagos" element={<PrivateRoute module="Ventas"><PagosList /></PrivateRoute>} />
      <Route path="/admin/pagos/nuevo" element={<PrivateRoute module="Ventas"><PagoCreate /></PrivateRoute>} />
      <Route path="/admin/pagos/:id" element={<PrivateRoute module="Ventas"><PagoDetail /></PrivateRoute>} />
      <Route path="/admin/usuarios" element={<PrivateRoute module="Usuarios"><UsersList source="usuarios" /></PrivateRoute>} />
      <Route path="/admin/roles" element={<PrivateRoute module="Configuración"><RolesList /></PrivateRoute>} />
      <Route path="/admin/roles/nuevo" element={<PrivateRoute module="Configuración"><RoleCreate /></PrivateRoute>} />
      <Route path="/admin/roles/editar/:id" element={<PrivateRoute module="Configuración"><RoleEdit /></PrivateRoute>} />
      <Route path="/admin/analytics" element={<PrivateRoute module="Reportes"><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/categorias" element={<PrivateRoute module="Categorías"><AdminCategorias /></PrivateRoute>} />
      <Route path="/admin/marcas" element={<PrivateRoute module="Marcas"><AdminMarcas /></PrivateRoute>} />
      <Route path="/admin/productos" element={<PrivateRoute module="Productos"><AdminProductos /></PrivateRoute>} />

      {/* === PERFIL DE USUARIO === */}
      <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
      <Route path="/cambiar-password" element={<PrivateRoute><CambiarPassword /></PrivateRoute>} />

      {/* === AUTENTICACIÓN === */}
      <Route path="/login" element={<PrivateRoute requireGuest><Login /></PrivateRoute>} />
      <Route path="/register" element={<PrivateRoute requireGuest><Register /></PrivateRoute>} />
      <Route path="/forgot-password" element={<PrivateRoute requireGuest><ForgotPassword /></PrivateRoute>} />
      <Route path="/reset-password" element={<PrivateRoute requireGuest><ResetPassword /></PrivateRoute>} />
    
    </Routes>
  );
};

export default Rutas;