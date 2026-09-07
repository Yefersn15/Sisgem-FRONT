import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingState from './LoadingState';

const PrivateRoute = ({ children, module, requireGuest }) => {
  const { user, hasPermission, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingState />;
  
  // Si requiere ser invitado (no estar logueado)
  if (requireGuest) {
    if (user) {
      // Ya está logueado, redirigir según el rol
      if (isAdmin) {
        return <Navigate to="/admin" replace />;
      }
      return <Navigate to={location.state?.from?.pathname || '/'} replace />;
    }
    return children;
  }

  // Si no está logueado, redirigir a login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

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