import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, module, requireGuest }) => {
  const { user, role, hasPermission, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Cargando...</div>;
  
  // Si requiere ser invitado (no estar logueado)
  if (requireGuest) {
    if (user) {
      // Ya está logueado, redirigir según el rol
      if (role?.nombre === 'ADMIN' || role?.nombre === 'Administrador' || user.rol_id === 5) {
        return <Navigate to="/admin" replace />;
      }
      return <Navigate to="/" replace />;
    }
    return children;
  }
  
  // Si no está logueado, redirigir a login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  // Verificar si es administrador
  const isAdmin = role?.nombre === 'ADMIN' || role?.nombre === 'Administrador' || user.rol_id === 5;
  
  // Si es admin, permitir acceso a todo
  if (isAdmin) {
    return children;
  }
  
  // Verificar permisos del módulo
  if (module && !hasPermission(module)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default PrivateRoute;