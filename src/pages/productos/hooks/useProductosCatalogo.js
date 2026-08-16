// src/pages/productos/hooks/useProductosCatalogo.js
import { useState, useEffect } from 'react';
import useDebounce from '../../../hooks/useDebounce';
import { getProductos } from '../services/productosService';
import { getMarcas } from '../../marcas/services/marcasService';
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

export const useProductosCatalogo = () => {
  const [productos, setProductos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [filterMarca, setFilterMarca] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filteredMarcas, setFilteredMarcas] = useState([]);
  const [filteredCategorias, setFilteredCategorias] = useState([]);
  const debouncedSearch = useDebounce(searchQuery, 500);

  const cargarProductos = async (marcasLocalParam, categoriasLocalParam) => {
    let lista = await getProductos();
    if (!Array.isArray(lista)) lista = lista && lista.data ? lista.data : (lista || []);

    const marcasLocal = marcasLocalParam || (await getMarcas());
    const categoriasLocal = categoriasLocalParam || (await getCategorias());

    lista = (lista || []).map((p) => ({
      ...p,
      marcaNombre: (marcasLocal || []).find((m) => String(m.id) === String(p.marcaId))?.nombre || 'Desconocida',
      categoriaNombre: (categoriasLocal || []).find((c) => String(c.id) === String(p.categoriaId))?.nombre || 'Desconocida',
    }));

    if (filterMarca) lista = lista.filter((p) => String(p.marcaId) === String(filterMarca));
    if (filterCategoria) lista = lista.filter((p) => String(p.categoriaId) === String(filterCategoria));
    if (debouncedSearch) {
      lista = lista.filter((p) =>
        p.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (!filterMarca && !filterCategoria && lista.length > 0) {
      const catsConProductos = [...new Set(lista.map((p) => p.categoriaId))].filter(Boolean);
      const marsConProductos = [...new Set(lista.map((p) => p.marcaId))].filter(Boolean);
      setFilteredMarcas((marcasLocal || []).filter((m) => marsConProductos.includes(String(m.id))));
      setFilteredCategorias((categoriasLocal || []).filter((c) => catsConProductos.includes(String(c.id))));
    } else if (filterMarca && !filterCategoria) {
      const catsConMarca = [...new Set(lista.map((p) => p.categoriaId))].filter(Boolean);
      setFilteredCategorias((categoriasLocal || []).filter((c) => catsConMarca.includes(String(c.id))));
    } else if (filterCategoria && !filterMarca) {
      const marsConCategoria = [...new Set(lista.map((p) => p.marcaId))].filter(Boolean);
      setFilteredMarcas((marcasLocal || []).filter((m) => marsConCategoria.includes(String(m.id))));
    }

    setProductos(ordenarProductos(lista, sortBy));
  };

  useEffect(() => {
    (async () => {
      const mar = await getMarcas();
      const cat = await getCategorias();
      const marList = Array.isArray(mar) ? mar : mar || [];
      const catList = Array.isArray(cat) ? cat : cat || [];
      setMarcas(marList);
      setCategorias(catList);
      setFilteredMarcas(marList);
      setFilteredCategorias(catList);
      await cargarProductos(marList, catList);
    })();
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [debouncedSearch, sortBy, filterMarca, filterCategoria]);

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('');
    setFilterMarca('');
    setFilterCategoria('');
  };

  const onFilterMarcaChange = (value) => {
    setFilterMarca(value);
    if (!value) setFilterCategoria('');
  };

  const onFilterCategoriaChange = (value) => {
    setFilterCategoria(value);
    if (!value) setFilterMarca('');
  };

  return {
    productos,
    marcas,
    categorias,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterMarca,
    onFilterMarcaChange,
    filterCategoria,
    onFilterCategoriaChange,
    filteredMarcas,
    filteredCategorias,
    clearFilters,
  };
};
