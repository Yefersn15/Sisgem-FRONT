// src/pages/productos/hooks/useProductosAdmin.js
import { useState, useEffect } from 'react';
import useDebounce from '../../../hooks/useDebounce';
import { getProductos, deleteProducto, updateProducto, exportProductos, importProductos } from '../services/productosService';
import { getMarcas } from '../../marcas/services/marcasService';
import { getCategorias } from '../../categorias/services/categoriasService';

const ITEMS_PER_PAGE = 20;

const ordenarProductos = (lista, sortBy) => {
  return [...lista].sort((a, b) => {
    switch (sortBy) {
      case 'nombre-asc': return (a.nombre || '').localeCompare(b.nombre || '');
      case 'nombre-desc': return (b.nombre || '').localeCompare(a.nombre || '');
      case 'id-asc': return (a.id || 0) - (b.id || 0);
      case 'id-desc': return (b.id || 0) - (a.id || 0);
      case 'stock-asc': return (parseInt(a.stockDisponible) || 0) - (parseInt(b.stockDisponible) || 0);
      case 'stock-desc': return (parseInt(b.stockDisponible) || 0) - (parseInt(a.stockDisponible) || 0);
      case 'precio-asc': return (parseFloat(a.precioUnitario) || 0) - (parseFloat(b.precioUnitario) || 0);
      case 'precio-desc': return (parseFloat(b.precioUnitario) || 0) - (parseFloat(a.precioUnitario) || 0);
      default: return (a.nombre || '').localeCompare(b.nombre || '');
    }
  });
};

export const useProductosAdmin = () => {
  const [productos, setProductos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filterMarca, setFilterMarca] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [sortBy, setSortBy] = useState('nombre-asc');
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [importStatus, setImportStatus] = useState({ message: '', type: '' });

  const cargarProductos = async (marcasLocal, categoriasLocal) => {
    let lista = (await getProductos()) || [];
    if (!Array.isArray(lista)) lista = lista.data ? lista.data : (lista || []);

    const marcasLocalVar = marcasLocal || (await getMarcas()) || [];
    const categoriasLocalVar = categoriasLocal || (await getCategorias()) || [];

    lista = lista.map((p) => ({
      ...p,
      marcaNombre: (marcasLocalVar.find((m) => String(m.id) === String(p.marcaId)) || {}).nombre || 'Sin marca',
      categoriaNombre: (categoriasLocalVar.find((c) => String(c.id) === String(p.categoriaId)) || {}).nombre || 'Sin categoría',
    }));

    if (filterMarca) lista = lista.filter((p) => String(p.marcaId) === String(filterMarca));
    if (filterCategoria) lista = lista.filter((p) => String(p.categoriaId) === String(filterCategoria));
    if (filterEstado) {
      lista = lista.filter((p) => (filterEstado === 'activo' ? p.activo !== false : p.activo === false));
    }
    if (debounced) {
      const q = debounced.toLowerCase();
      lista = lista.filter((p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion?.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      );
    }

    setProductos(ordenarProductos(lista, sortBy));
    setCurrentPage(1);
  };

  useEffect(() => {
    (async () => {
      const mar = (await getMarcas()) || [];
      const cat = (await getCategorias()) || [];
      setMarcas(mar);
      setCategorias(cat);
      await cargarProductos(mar, cat);
    })();
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [debounced, filterMarca, filterCategoria, filterEstado, sortBy]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      await deleteProducto(id);
      await cargarProductos();
    }
  };

  const toggleActivo = async (producto) => {
    await updateProducto(producto.id, { ...producto, activo: !producto.activo });
    await cargarProductos();
  };

  const handleExport = () => exportProductos();

  const handleImport = (file) => {
    if (!file) return;
    importProductos(
      file,
      (count) => {
        setImportStatus({ message: `${count} productos importados exitosamente`, type: 'success' });
        cargarProductos();
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
    setFilterMarca('');
    setFilterCategoria('');
    setFilterEstado('');
    setSortBy('nombre-asc');
  };

  const totalPages = Math.ceil(productos.length / ITEMS_PER_PAGE);
  const paginatedItems = productos.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return {
    marcas,
    categorias,
    paginatedItems,
    currentPage,
    setCurrentPage,
    totalPages,
    query,
    setQuery,
    filterMarca,
    setFilterMarca,
    filterCategoria,
    setFilterCategoria,
    filterEstado,
    setFilterEstado,
    sortBy,
    setSortBy,
    clearFilters,
    importStatus,
    setImportStatus,
    handleDelete,
    toggleActivo,
    handleExport,
    handleImport,
  };
};
