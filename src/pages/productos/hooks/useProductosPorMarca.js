// src/pages/productos/hooks/useProductosPorMarca.js
import { useState, useEffect } from 'react';
import useDebounce from '../../../hooks/useDebounce';
import { getProductos, deleteProducto, updateProducto } from '../services/productosService';
import { getMarcaById } from '../../marcas/services/marcasService';
import { getCategorias } from '../../categorias/services/categoriasService';

const ordenarProductos = (lista, sortBy) => {
  if (!sortBy) return lista;
  return [...lista].sort((a, b) => {
    switch (sortBy) {
      case 'nombre': return a.nombre.localeCompare(b.nombre);
      case '-nombre': return b.nombre.localeCompare(a.nombre);
      case 'precio': return a.precioUnitario - b.precioUnitario;
      case '-precio': return b.precioUnitario - a.precioUnitario;
      case 'stock': return b.stockDisponible - a.stockDisponible;
      case '-stock': return a.stockDisponible - b.stockDisponible;
      default: return 0;
    }
  });
};

export const useProductosPorMarca = (id) => {
  const [marca, setMarca] = useState(null);
  const [productos, setProductos] = useState([]);
  const [allProductos, setAllProductos] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const mar = await getMarcaById(id);
      setMarca(mar);
      const todos = (await getProductos()) || [];
      const filtrados = todos.filter((p) => String(p.marcaId) === String(id));
      const categorias = (await getCategorias()) || [];
      const enriquecidos = filtrados.map((p) => ({
        ...p,
        categoriaNombre: (categorias.find((c) => String(c.id) === String(p.categoriaId)) || {}).nombre || 'Desconocida',
        marcaNombre: mar?.nombre || 'Desconocida',
      }));
      setAllProductos(enriquecidos);
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    let lista = allProductos.slice();
    if (categoryFilter) lista = lista.filter((p) => String(p.categoriaId) === String(categoryFilter));
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      lista = lista.filter((p) => (p.nombre || '').toLowerCase().includes(q) || (p.descripcion || '').toLowerCase().includes(q));
    }
    setProductos(ordenarProductos(lista, sortBy));
  }, [allProductos, categoryFilter, debouncedSearch, sortBy]);

  const handleDelete = (productoId, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar el producto "${nombre}"?`)) {
      deleteProducto(productoId);
      setProductos((prev) => prev.filter((p) => p.id !== productoId));
      setAllProductos((prev) => prev.filter((p) => p.id !== productoId));
    }
  };

  const handleToggleActivo = (productoId, currentActivo, nombre) => {
    if (!window.confirm(`¿Deseas ${currentActivo ? 'desactivar' : 'activar'} el producto "${nombre}"?`)) return;
    updateProducto(productoId, { activo: !currentActivo });
    setAllProductos((prev) => prev.map((p) => (String(p.id) === String(productoId) ? { ...p, activo: !currentActivo } : p)));
  };

  return {
    marca,
    productos,
    allProductos,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    loading,
    handleDelete,
    handleToggleActivo,
  };
};
