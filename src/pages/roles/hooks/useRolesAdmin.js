// src/pages/roles/hooks/useRolesAdmin.js
import { useState, useEffect } from 'react';
import { getRoles, deleteRol, getPermisosDisponibles } from '../services/rolesService';
import { usePermisosPorCategoria } from './usePermisosPorCategoria';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';

export const useRolesAdmin = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [roles, setRoles] = useState([]);
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);
  const [showPermisos, setShowPermisos] = useState(null);
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

  return {
    roles,
    showPermisos,
    toggleShowPermisos,
    categoriasPermisos,
    handleDelete,
    getPermisosAsignados,
  };
};
