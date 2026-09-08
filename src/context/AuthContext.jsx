import React, { createContext, useContext, useState, useEffect } from 'react';
import { request } from '../services/api/client';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components -- hook co-ubicado a propósito con su Provider
export const useAuth = () => useContext(AuthContext);

// Criterio único de "es administrador": antes repetido literalmente en
// PrivateRoute, Header y demás componentes de menú. `role` nunca se
// setea en este contexto (no hay endpoint que lo llene), así que el chequeo
// real recae sobre los campos que sí trae el usuario autenticado.
// eslint-disable-next-line react-refresh/only-export-components -- función utilitaria co-ubicada a propósito
export const esAdmin = (user, role) =>
  role?.nombre === 'ADMIN' || role?.nombre === 'Administrador' ||
  user?.rol_id === 5 || user?.rol === 'ADMIN' || user?.rol === 'Administrador';

// hasPermission() recibe las mismas etiquetas en español que ya usan
// Rutas.jsx/AdminLayout.jsx/navConfig.js/storeNavConfig.js (module="Ventas",
// permission: 'Configuración', etc.) — nunca los strings reales que guarda
// el backend en rol.permisos (p. ej. "ventas.write"). Antes hasPermission
// comparaba la etiqueta contra esos strings tal cual, así que para CUALQUIER
// rol que no fuera ADMIN literal nunca coincidía nada: cada ruta protegida
// por module redirigía a "/" y cada grupo de menú desaparecía, sin importar
// qué permisos se le marcaran al rol desde el panel. Este mapeo traduce cada
// etiqueta a los prefijos de permiso reales que representa — algunas
// etiquetas ya se usaban como paraguas de varias categorías del backend a la
// vez (p. ej. "Ventas" protege también Pedidos/Pagos/Domicilios, y
// "Configuración" protege tanto Roles como Configuración de tienda).
const ETIQUETA_A_PREFIJOS_PERMISO = {
  'Productos': ['productos'],
  'Marcas': ['marcas'],
  'Categorías': ['categorias'],
  'Inventario': ['productos', 'marcas', 'categorias'],
  'Banners': ['banners'],
  'Caja': ['caja'],
  'Ventas': ['ventas', 'pedidos', 'pagos', 'domicilios'],
  'Usuarios': ['usuarios'],
  'Configuración': ['roles', 'config'],
  'Reportes': ['reportes'],
};

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

  const isAdmin = esAdmin(user, role);

  const hasPermission = (moduleName) => {
    if (!user) return false;
    // El rol de ADMIN/Administrador tiene todos los permisos
    if (isAdmin) return true;
    // `modules` trae los permisos reales del rol (p. ej. "productos.write");
    // `moduleName` es la etiqueta en español que ya usan las rutas/menús
    // (ver ETIQUETA_A_PREFIJOS_PERMISO más arriba) — se traduce a los
    // prefijos que representa y se busca cualquier permiso que empiece así.
    const prefijos = ETIQUETA_A_PREFIJOS_PERMISO[moduleName] || [moduleName.toLowerCase()];
    return modules.some(m => {
      const permiso = typeof m === 'string' ? m : m?.nombre;
      if (!permiso) return false;
      return prefijos.some(prefijo => permiso === prefijo || permiso.startsWith(`${prefijo}.`));
    });
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
      isAdmin,
      loading,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;