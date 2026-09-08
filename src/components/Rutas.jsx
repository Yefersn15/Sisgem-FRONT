import { Routes, Route } from 'react-router-dom';
import Home from '../pages/home/Home';
import Nosotros from '../pages/nosotros/Nosotros';
import ProductosList from '../pages/productos/ProductosList';
import ProductoCreate from '../pages/productos/ProductoCreate';
import ProductoEdit from '../pages/productos/ProductoEdit';
import ProductosPorCategoria from '../pages/productos/ProductosPorCategoria';
import ProductosPorMarca from '../pages/productos/ProductosPorMarca';
import MarcasList from '../pages/marcas/MarcasList';
import MarcaCreate from '../pages/marcas/MarcaCreate';
import MarcaEdit from '../pages/marcas/MarcaEdit';
import MarcaDetail from '../pages/marcas/MarcaDetail';
import CategoriasList from '../pages/categorias/CategoriasList';
import CategoriaCreate from '../pages/categorias/CategoriaCreate';
import CategoriaEdit from '../pages/categorias/CategoriaEdit';
import Cart from '../pages/carrito/Cart';
import Checkout from '../pages/carrito/Checkout';
import MisPedidos from '../pages/pedidos/MisPedidos';
import VentaDetails from '../pages/ventas/VentaDetails';
import DomiciliosAdmin from '../pages/domicilios/DomiciliosAdmin';
import MisDomicilios from '../pages/domicilios/MisDomicilios';
import MisEntregas from '../pages/domicilios/MisEntregas';
import CajaAdmin from '../pages/caja/CajaAdmin';

// Admin
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import VentasAdmin from '../pages/ventas/VentasAdmin';
import PedidosAdmin from '../pages/pedidos/PedidosAdmin';
import PagosAdmin from '../pages/pagos/PagosAdmin';
import PagoCreate from '../pages/pagos/PagoCreate';
import PagoDetail from '../pages/pagos/PagoDetail';
import MisPagos from '../pages/pagos/MisPagos';
import UsuariosAdmin from '../pages/usuarios/UsuariosAdmin';
import UsuarioEdit from '../pages/usuarios/UsuarioEdit';
import RolesAdmin from '../pages/roles/RolesAdmin';
import RoleCreate from '../pages/roles/RoleCreate';
import RoleEdit from '../pages/roles/RoleEdit';
import CategoriasAdmin from '../pages/categorias/CategoriasAdmin';
import MarcasAdmin from '../pages/marcas/MarcasAdmin';
import ProductosAdmin from '../pages/productos/ProductosAdmin';



// Auth
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Perfil from '../pages/usuarios/Perfil';
import CambiarPassword from '../pages/usuarios/CambiarPassword';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Protected Route
import PrivateRoute from './PrivateRoute';

const Rutas = ({ vistaLlamativa }) => {
  return (
    <Routes>
      {/* === PÚBLICAS: Home / Tienda === */}
      <Route path="/" element={<Home vistaLlamativa={vistaLlamativa} />} />
      <Route path="/nosotros" element={<Nosotros />} />
      
      {/* === PRODUCTOS === */}
      <Route path="/productos" element={<ProductosList />} />
      <Route path="/productos/nuevo" element={<PrivateRoute module="Productos"><ProductoCreate /></PrivateRoute>} />
      <Route path="/productos/editar/:id" element={<PrivateRoute module="Productos"><ProductoEdit /></PrivateRoute>} />
      <Route path="/productos/ver/:id" element={<PrivateRoute module="Productos"><ProductoEdit esDetalle={true} /></PrivateRoute>} />
      <Route path="/productos/:id" element={<PrivateRoute module="Productos"><ProductoEdit esDetalle={true} /></PrivateRoute>} />
      <Route path="/productos/por-categoria/:id" element={<ProductosPorCategoria />} />
      <Route path="/productos/por-marca/:id" element={<ProductosPorMarca />} />

      {/* === MARCAS === */}
      <Route path="/marcas" element={<MarcasList />} />
      <Route path="/marcas/nueva" element={<PrivateRoute module="Marcas"><MarcaCreate /></PrivateRoute>} />
      <Route path="/marcas/editar/:id" element={<PrivateRoute module="Marcas"><MarcaEdit /></PrivateRoute>} />
      <Route path="/marcas/:id" element={<PrivateRoute module="Marcas"><MarcaDetail /></PrivateRoute>} />

      {/* === CATEGORÍAS === */}
      <Route path="/categorias" element={<CategoriasList />} />
      <Route path="/categorias/nueva" element={<PrivateRoute module="Categorías"><CategoriaCreate /></PrivateRoute>} />
      <Route path="/categorias/editar/:id" element={<PrivateRoute module="Categorías"><CategoriaEdit /></PrivateRoute>} />

      {/* === CARRITO Y TIENDA === */}
      <Route path="/carrito" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/ventas" element={<PrivateRoute><MisPagos /></PrivateRoute>} />
      <Route path="/ventas/:id" element={<VentaDetails />} />
      <Route path="/pedidos/:id" element={<VentaDetails />} />
      <Route path="/mis-pagos" element={<PrivateRoute><MisPagos /></PrivateRoute>} />
      <Route path="/mis-pedidos" element={<PrivateRoute><MisPedidos /></PrivateRoute>} />
      <Route path="/mis-domicilios" element={<PrivateRoute><MisDomicilios /></PrivateRoute>} />
      <Route path="/mis-entregas" element={<PrivateRoute><MisEntregas /></PrivateRoute>} />

      {/* === RUTAS DEL ADMIN === */}
      <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/ventas" element={<PrivateRoute module="Ventas"><VentasAdmin /></PrivateRoute>} />
      <Route path="/admin/pedidos" element={<PrivateRoute module="Ventas"><PedidosAdmin /></PrivateRoute>} />
      <Route path="/admin/domicilios" element={<PrivateRoute module="Ventas"><DomiciliosAdmin /></PrivateRoute>} />
      <Route path="/admin/caja" element={<PrivateRoute module="Caja"><CajaAdmin /></PrivateRoute>} />
      <Route path="/admin/pagos" element={<PrivateRoute module="Ventas"><PagosAdmin /></PrivateRoute>} />
      <Route path="/admin/pagos/nuevo" element={<PrivateRoute module="Ventas"><PagoCreate /></PrivateRoute>} />
      <Route path="/admin/pagos/:id" element={<PrivateRoute module="Ventas"><PagoDetail /></PrivateRoute>} />
      <Route path="/admin/usuarios" element={<PrivateRoute module="Usuarios"><UsuariosAdmin source="usuarios" /></PrivateRoute>} />
      <Route path="/admin/roles" element={<PrivateRoute module="Configuración"><RolesAdmin /></PrivateRoute>} />
      <Route path="/admin/roles/nuevo" element={<PrivateRoute module="Configuración"><RoleCreate /></PrivateRoute>} />
      <Route path="/admin/roles/editar/:id" element={<PrivateRoute module="Configuración"><RoleEdit /></PrivateRoute>} />
      <Route path="/admin/analytics" element={<PrivateRoute module="Reportes"><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/categorias" element={<PrivateRoute module="Categorías"><CategoriasAdmin /></PrivateRoute>} />
      <Route path="/admin/marcas" element={<PrivateRoute module="Marcas"><MarcasAdmin /></PrivateRoute>} />
      <Route path="/admin/productos" element={<PrivateRoute module="Productos"><ProductosAdmin /></PrivateRoute>} />

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