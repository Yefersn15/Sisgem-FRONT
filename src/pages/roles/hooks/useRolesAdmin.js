// src/pages/roles/hooks/useRolesAdmin.js
import { useState, useEffect, useMemo } from 'react';
import { getRoles, deleteRol, getPermisosDisponibles } from '../services/rolesService';
import { usePermisosPorCategoria } from './usePermisosPorCategoria';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';

const ITEMS_PER_PAGE = 5;

export const useRolesAdmin = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [roles, setRoles] = useState([]);
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);
  const [showPermisos, setShowPermisos] = useState(null);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const categoriasPermisos = usePermisosPorCategoria(permisosDisponibles);

  const loadData = async () => {
    const [rolesData, permisosData] = await Promise.all([getRoles(), getPermisosDisponibles()]);
    setRoles(rolesData);
    setPermisosDisponibles(permisosData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id, nombre) => {
    if (nombre?.toUpperCase() === 'ADMIN' || nombre?.toUpperCase() === 'ADMINISTRADOR') {
      toast.error('El rol de Administrador no puede ser eliminado.');
      return;
    }
    if (await confirm('¿Eliminar este rol? Los usuarios con este rol perderán acceso.')) {
      try {
        await deleteRol(id);
        await loadData();
      } catch (err) {
        toast.error('Error al eliminar: ' + err.message);
      }
    }
  };

  const toggleShowPermisos = (id) => {
    setShowPermisos((prev) => (prev === id ? null : id));
  };

  const getPermisosAsignados = (rol) => rol.permisos || [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) =>
      (r.nombre || '').toLowerCase().includes(q) ||
      (r.descripcion || '').toLowerCase().includes(q)
    );
  }, [roles, query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const clearFilters = () => setQuery('');

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return {
    roles,
    query,
    setQuery,
    clearFilters,
    paginatedItems,
    currentPage,
    setCurrentPage,
    totalPages,
    showPermisos,
    toggleShowPermisos,
    categoriasPermisos,
    handleDelete,
    getPermisosAsignados,
  };
};
