// src/pages/categorias/hooks/useCategoriasAdmin.js
import { useState, useEffect } from 'react';
import useDebounce from '../../../hooks/useDebounce';
import { getCategorias, deleteCategoria, updateCategoria, exportCategorias, importCategorias } from '../services/categoriasService';
import { getProductos } from '../../../services/api/productos.api';
import { useConfirm } from '../../../context/ConfirmContext';

const ITEMS_PER_PAGE = 5;

const ordenarCategorias = (lista, sortBy) => {
  return [...lista].sort((a, b) => {
    switch (sortBy) {
      case 'nombre-asc': return a.nombre.localeCompare(b.nombre);
      case 'nombre-desc': return b.nombre.localeCompare(a.nombre);
      case 'id-asc': return (a.id || 0) - (b.id || 0);
      case 'id-desc': return (b.id || 0) - (a.id || 0);
      case 'productos-asc': return (a.productoCount || 0) - (b.productoCount || 0);
      case 'productos-desc': return (b.productoCount || 0) - (a.productoCount || 0);
      default: return a.nombre.localeCompare(b.nombre);
    }
  });
};

export const useCategoriasAdmin = () => {
  const confirm = useConfirm();
  const [categorias, setCategorias] = useState([]);
  const [filterEstado, setFilterEstado] = useState('');
  const [sortBy, setSortBy] = useState('nombre-asc');
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [importStatus, setImportStatus] = useState({ message: '', type: '' });

  const cargarCategorias = async () => {
    let lista = (await getCategorias()) || [];
    if (!Array.isArray(lista)) lista = lista.data ? lista.data : (lista || []);

    const productos = (await getProductos()) || [];

    lista = lista.map((c) => {
      const productosCategoria = productos.filter((p) => String(p.categoriaId) === String(c.id));
      return { ...c, productoCount: productosCategoria.length, activa: c.activa !== false };
    });

    if (filterEstado) {
      lista = lista.filter((c) => (filterEstado === 'activa' ? c.activa === true : c.activa === false));
    }

    if (debounced) {
      const q = debounced.toLowerCase();
      lista = lista.filter((c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.descripcion?.toLowerCase().includes(q) ||
        String(c.id).includes(q)
      );
    }

    setCategorias(ordenarCategorias(lista, sortBy));
    setCurrentPage(1);
  };

  useEffect(() => {
    cargarCategorias();
  }, [debounced, filterEstado, sortBy]);

  const handleDelete = async (id) => {
    if (await confirm('¿Estás seguro de eliminar esta categoría?')) {
      await deleteCategoria(id);
      await cargarCategorias();
    }
  };

  const toggleActiva = async (categoria) => {
    await updateCategoria(categoria.id, { ...categoria, activa: !categoria.activa });
    await cargarCategorias();
  };

  const handleExport = () => exportCategorias();

  const handleImport = (file) => {
    if (!file) return;
    importCategorias(
      file,
      (count) => {
        setImportStatus({ message: `${count} categorías importadas exitosamente`, type: 'success' });
        cargarCategorias();
        setTimeout(() => setImportStatus({ message: '', type: '' }), 3000);
      },
      (error) => {
        setImportStatus({ message: error.message || 'Error al importar', type: 'danger' });
        setTimeout(() => setImportStatus({ message: '', type: '' }), 5000);
      }
    );
  };

  const clearFilters = () => {
    setQuery('');
    setFilterEstado('');
    setSortBy('nombre-asc');
  };

  const totalPages = Math.ceil(categorias.length / ITEMS_PER_PAGE);
  const paginatedItems = categorias.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return {
    categorias,
    paginatedItems,
    currentPage,
    setCurrentPage,
    totalPages,
    query,
    setQuery,
    filterEstado,
    setFilterEstado,
    sortBy,
    setSortBy,
    clearFilters,
    importStatus,
    setImportStatus,
    handleDelete,
    toggleActiva,
    handleExport,
    handleImport,
  };
};
