// src/pages/marcas/hooks/useMarcasAdmin.js
import { useState, useEffect } from 'react';
import useDebounce from '../../../hooks/useDebounce';
import { getMarcas, deleteMarca, updateMarca, exportMarcas, importMarcas } from '../services/marcasService';
import { getProductos } from '../../../services/dataService';

const ITEMS_PER_PAGE = 20;

const ordenarMarcas = (lista, sortBy) => {
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

export const useMarcasAdmin = () => {
  const [marcas, setMarcas] = useState([]);
  const [filterEstado, setFilterEstado] = useState('');
  const [sortBy, setSortBy] = useState('nombre-asc');
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [importStatus, setImportStatus] = useState({ message: '', type: '' });

  const cargarMarcas = async () => {
    let lista = (await getMarcas()) || [];
    if (!Array.isArray(lista)) lista = lista.data ? lista.data : (lista || []);

    const productos = (await getProductos()) || [];

    lista = lista.map((m) => {
      const productosMarca = productos.filter((p) => String(p.marcaId) === String(m.id));
      return { ...m, productoCount: productosMarca.length, activa: m.activa !== false };
    });

    if (filterEstado) {
      lista = lista.filter((m) => (filterEstado === 'activa' ? m.activa === true : m.activa === false));
    }

    if (debounced) {
      const q = debounced.toLowerCase();
      lista = lista.filter((m) =>
        m.nombre.toLowerCase().includes(q) ||
        m.descripcion?.toLowerCase().includes(q) ||
        String(m.id).includes(q)
      );
    }

    setMarcas(ordenarMarcas(lista, sortBy));
    setCurrentPage(1);
  };

  useEffect(() => {
    cargarMarcas();
  }, [debounced, filterEstado, sortBy]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta marca?')) {
      await deleteMarca(id);
      await cargarMarcas();
    }
  };

  const toggleActiva = async (marca) => {
    await updateMarca(marca.id, { ...marca, activa: !marca.activa });
    await cargarMarcas();
  };

  const handleExport = () => exportMarcas();

  const handleImport = (file) => {
    if (!file) return;
    importMarcas(
      file,
      (count) => {
        setImportStatus({ message: `${count} marcas importadas exitosamente`, type: 'success' });
        cargarMarcas();
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

  const totalPages = Math.ceil(marcas.length / ITEMS_PER_PAGE);
  const paginatedItems = marcas.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return {
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
