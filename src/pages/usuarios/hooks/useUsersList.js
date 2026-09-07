// src/pages/usuarios/hooks/useUsersList.js
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getUsuarios, toggleUsuarioEstado, updateUsuario, exportUsuarios, importUsuarios } from '../services/usuariosService';
import { getRoles } from '../../roles/services/rolesService';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';

const ITEMS_PER_PAGE = 5;

export const useUsersList = (source = 'usuarios') => {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showRoleModal, setShowRoleModal] = useState(null);
  const [showDetalleModal, setShowDetalleModal] = useState(null);
  const [importStatus, setImportStatus] = useState({ message: '', type: '' });
  const fileRef = useRef(null);

  const isAdmin = currentUser && (currentUser.rol_id === 5 || currentUser.rol === 'ADMIN');

  const loadData = async () => {
    if (source === 'usuarios') {
      const [users, rolesData] = await Promise.all([getUsuarios(), getRoles()]);
      setUsuarios(users);
      setRoles(rolesData);
    }
  };

  useEffect(() => {
    loadData();
  }, [source]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterRol]);

  const handleToggle = async (id, nombre, estadoActual) => {
    const accion = estadoActual ? 'Desactivar' : 'Activar';
    if (!(await confirm(`¿${accion} el usuario "${nombre}"?`))) return;
    try {
      await toggleUsuarioEstado(id, !estadoActual);
      await loadData();
    } catch (err) {
      toast.error('Error al cambiar estado: ' + (err.message || 'Error desconocido'));
    }
  };

  const handleRoleChange = async (userId, newRoleId) => {
    try {
      await updateUsuario(userId, { rolId: newRoleId });
      await loadData();
      setShowRoleModal(null);
    } catch (err) {
      toast.error('Error al cambiar rol: ' + (err.message || 'Intente nuevamente'));
    }
  };

  const handleExport = async () => {
    await exportUsuarios();
  };

  const handleImport = (file) => {
    if (!file) return;
    importUsuarios(
      file,
      (count) => {
        setImportStatus({ message: `Importados ${count} usuarios`, type: 'success' });
        loadData();
        if (fileRef.current) fileRef.current.value = '';
        setTimeout(() => setImportStatus({ message: '', type: '' }), 3000);
      },
      (err) => {
        setImportStatus({ message: 'Error importando: ' + (err?.message || err), type: 'danger' });
        setTimeout(() => setImportStatus({ message: '', type: '' }), 5000);
      }
    );
  };

  const filtered = usuarios.filter(u => {
    const matchSearch = !search ||
      (u.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRol = source === 'usuarios' ? (!filterRol || String(u.rol_id) === String(filterRol)) : true;
    return matchSearch && matchRol;
  });

  const getRoleName = (rolId, fallbackName) => {
    if (!rolId && fallbackName) return fallbackName;
    if (!rolId) return 'Sin rol';
    const rol = roles.find(r => String(r.id) === String(rolId));
    return rol ? rol.nombre : (fallbackName || 'Sin rol');
  };

  const clearFilters = () => {
    setSearch('');
    setFilterRol('');
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return {
    currentUser,
    isAdmin,
    usuarios,
    roles,
    search,
    setSearch,
    filterRol,
    setFilterRol,
    clearFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    showRoleModal,
    setShowRoleModal,
    showDetalleModal,
    setShowDetalleModal,
    importStatus,
    fileRef,
    loadData,
    handleToggle,
    handleRoleChange,
    handleExport,
    handleImport,
    filtered,
    paginatedItems,
    getRoleName,
  };
};
