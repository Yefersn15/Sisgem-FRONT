// src/services/api/roles.api.js
import { request } from './client';

export const getRoles = async () => {
  const data = await request('/api/roles');
  return Array.isArray(data) ? data.map(r => ({
    id: r._id || r.id,
    nombre: r.nombre,
    descripcion: r.descripcion,
    estado: r.estado,
    permisos: r.permisos || [],
    esDefault: r.esDefault || false
  })) : [];
};

export const getRoleById = async (id) => {
  const data = await request(`/api/roles/${id}`);
  return data;
};

export const createRol = async (rol) => {
  const data = await request('/api/roles', { method: 'POST', body: rol });
  return data;
};

export const updateRol = async (id, rol) => {
  const data = await request(`/api/roles/${id}`, { method: 'PUT', body: rol });
  return data;
};

export const deleteRol = async (id) => {
  await request(`/api/roles/${id}`, { method: 'DELETE' });
};

export const getPermisosDisponibles = async () => {
  // Lista de permisos disponibles en el sistema
  return [
    // Ventas
    'ventas.read', 'ventas.write', 'ventas.delete',
    // Pedidos
    'pedidos.read', 'pedidos.write', 'pedidos.delete',
    // Pagos
    'pagos.read', 'pagos.write', 'pagos.delete',
    // Domicilios
    'domicilios.read', 'domicilios.write', 'domicilios.delete',
    // Productos
    'productos.read', 'productos.write', 'productos.delete',
    // Categorías
    'categorias.read', 'categorias.write', 'categorias.delete',
    // Marcas
    'marcas.read', 'marcas.write', 'marcas.delete',
    // Usuarios
    'usuarios.read', 'usuarios.write', 'usuarios.delete',
    // Roles
    'roles.read', 'roles.write', 'roles.delete',
    // Configuración
    'config.read', 'config.write',
    // Reportes
    'reportes.read'
  ];
};

// Legacy - getModulos returns permisos disponibles
export const getModulos = async () => {
  return getPermisosDisponibles();
};

export const seedRoles = async () => {
  const data = await request('/api/roles/seed', { method: 'POST' });
  return data;
};

export const getRoleModules = async (rolId) => {
  // Si no hay módulos en el API, devolvemos vacío
  return [];
};

export const assignRoleModules = async (rolId, modulos) => {
  // No implementado en el API; solo placeholder
  return { success: true };
};
