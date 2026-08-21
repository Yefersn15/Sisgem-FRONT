// src/pages/productos/hooks/useProductosPorCategoria.js
import { useState, useEffect } from 'react';
import useDebounce from '../../../hooks/useDebounce';
import { getProductos, deleteProducto, updateProducto } from '../services/productosService';
import { getCategoriaById } from '../../categorias/services/categoriasService';
import { getMarcas } from '../../marcas/services/marcasService';
import { useConfirm } from '../../../context/ConfirmContext';

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

export const useProductosPorCategoria = (id) => {
  const confirm = useConfirm();
  const [categoria, setCategoria] = useState(null);
  const [productos, setProductos] = useState([]);
  const [allProductos, setAllProductos] = useState([]);
  const [brandFilter, setBrandFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const cat = await getCategoriaById(id);
      setCategoria(cat);
      const todos = (await getProductos()) || [];
      const filtrados = todos.filter((p) => String(p.categoriaId) === String(id));
      const marcas = (await getMarcas()) || [];
      const enriquecidos = filtrados.map((p) => ({
        ...p,
        marcaNombre: (marcas.find((m) => String(m.id) === String(p.marcaId)) || {}).nombre || 'Desconocida',
        categoriaNombre: cat?.nombre || 'Desconocida',
      }));
      setAllProductos(enriquecidos);
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    let lista = allProductos.slice();
    if (brandFilter) lista = lista.filter((p) => String(p.marcaId) === String(brandFilter));
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      lista = lista.filter((p) => (p.nombre || '').toLowerCase().includes(q) || (p.descripcion || '').toLowerCase().includes(q));
    }
    setProductos(ordenarProductos(lista, sortBy));
  }, [allProductos, brandFilter, debouncedSearch, sortBy]);

  const handleDelete = async (productoId, nombre) => {
    if (await confirm(`¿Estás seguro de eliminar el producto "${nombre}"?`)) {
      deleteProducto(productoId);
      setProductos((prev) => prev.filter((p) => p.id !== productoId));
      setAllProductos((prev) => prev.filter((p) => p.id !== productoId));
    }
  };

  const handleToggleActivo = async (productoId, currentActivo, nombre) => {
    if (!(await confirm(`¿Deseas ${currentActivo ? 'desactivar' : 'activar'} el producto "${nombre}"?`))) return;
    updateProducto(productoId, { activo: !currentActivo });
    setAllProductos((prev) => prev.map((p) => (String(p.id) === String(productoId) ? { ...p, activo: !currentActivo } : p)));
  };

  return {
    categoria,
    productos,
    allProductos,
    brandFilter,
    setBrandFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    loading,
    handleDelete,
    handleToggleActivo,
  };
};
