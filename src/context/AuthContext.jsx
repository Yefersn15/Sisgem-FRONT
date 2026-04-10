import React, { createContext, useContext, useState, useEffect } from 'react';
import { request } from '../services/dataService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // Obtener usuario actual desde la API
          const userData = await request('/api/auth/me');
          setUser(userData);
          localStorage.setItem('auth_user', JSON.stringify(userData));
          
          // Usar permisos del usuario directamente
          if (userData.permisos) {
            setModules(userData.permisos);
          }
        } catch (e) {
          console.warn('Error obteniendo usuario desde API:', e.message || e);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email, password) => {
    try {
      // Usamos request para tener manejo unificado de errores y respuestas
      const data = await request('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      // La API devuelve { token, usuario } dentro de data
      const token = data.token;
      const userObj = data.usuario;

      if (!token) throw new Error('No se recibió token');

      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(userObj));
      setUser(userObj);

      // Usar permisos del usuario directamente
      if (userObj.permisos) {
        setModules(userObj.permisos);
      }

      return { success: true, user: userObj };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: err.message || 'Error al iniciar sesión' };
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setModules([]);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const hasPermission = (moduleName) => {
    if (!user) return false;
    // El rol de ADMIN/Administrador tiene todos los permisos
    if (role?.nombre === 'ADMIN' || role?.nombre === 'Administrador' || user?.rol_id === 5) return true;
    // Verificar en módulos/permisos
    return modules.some(m => m.nombre === moduleName || m === moduleName);
  };

  const refreshUser = async () => {
    try {
      const userData = await request('/api/auth/me');
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      return userData;
    } catch (e) {
      console.error('Error refreshing user:', e);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      modules, 
      login, 
      logout, 
      hasPermission, 
      loading,
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;