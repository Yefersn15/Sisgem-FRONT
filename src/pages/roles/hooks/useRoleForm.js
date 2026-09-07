// src/pages/roles/hooks/useRoleForm.js
// Cubre tanto crear como editar: sin `id` crea un rol nuevo, con `id` carga
// el rol existente y actualiza. Evita duplicar la carga de permisos
// disponibles y el submit entre RoleCreate y RoleEdit.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPermisosDisponibles, getRoleById, createRol, updateRol } from '../services/rolesService';
import { usePermisosPorCategoria } from './usePermisosPorCategoria';
import { usePermisosSelector } from './usePermisosSelector';
import { useToast } from '../../../context/ToastContext';

const esRolProtegido = (nombre) =>
  nombre?.toUpperCase() === 'ADMIN' || nombre?.toUpperCase() === 'ADMINISTRADOR';

export const useRoleForm = (id) => {
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState(true);
  const [esDefault, setEsDefault] = useState(false);
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const { permisos, setPermisos, togglePermiso, toggleCategoria } = usePermisosSelector([]);
  const categoriasPermisos = usePermisosPorCategoria(permisosDisponibles);

  useEffect(() => {
    if (!isEdit) {
      getPermisosDisponibles().then(setPermisosDisponibles);
      return;
    }

    Promise.all([getPermisosDisponibles(), getRoleById(id)]).then(([perms, rol]) => {
      setPermisosDisponibles(perms);
      if (rol) {
        setNombre(rol.nombre || '');
        setDescripcion(rol.descripcion || '');
        setEstado(rol.estado !== false);
        setEsDefault(rol.esDefault === true);
        setPermisos(rol.permisos || []);

        if (esRolProtegido(rol.nombre)) {
          toast.error('El rol de Administrador no puede ser editado.');
          navigate('/admin/roles');
        }
      }
      setLoadingData(false);
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error('El nombre del rol es requerido');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await updateRol(id, { nombre, descripcion, estado, permisos, esDefault });
      } else {
        await createRol({ nombre, descripcion, permisos, esDefault });
      }
      navigate('/admin/roles');
    } catch (err) {
      toast.error(`Error al ${isEdit ? 'actualizar' : 'crear'} rol: ` + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return {
    nombre,
    setNombre,
    descripcion,
    setDescripcion,
    estado,
    setEstado,
    esDefault,
    setEsDefault,
    permisos,
    togglePermiso,
    toggleCategoria,
    categoriasPermisos,
    loading,
    loadingData,
    handleSubmit,
  };
};
