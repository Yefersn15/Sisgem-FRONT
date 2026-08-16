// src/pages/categorias/hooks/useCategoriasCatalogo.js
import { useState, useEffect } from 'react';
import useDebounce from '../../../hooks/useDebounce';
import { getCategorias } from '../services/categoriasService';

export const useCategoriasCatalogo = () => {
  const [categorias, setCategorias] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  const cargarCategorias = async () => {
    let lista = await getCategorias();
    if (!Array.isArray(lista)) lista = lista && lista.data ? lista.data : (lista || []);

    if (debouncedSearch) {
      lista = (lista || []).filter((c) => (c.nombre || '').toLowerCase().includes(debouncedSearch.toLowerCase()));
    }

    if (sortBy === 'nombre') {
      lista.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
    } else if (sortBy === '-nombre') {
      lista.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || ''));
    }

    setCategorias(lista);
  };

  useEffect(() => {
    cargarCategorias();
  }, [debouncedSearch, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('');
  };

  return { categorias, searchQuery, setSearchQuery, sortBy, setSortBy, clearFilters };
};
