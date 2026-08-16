// src/pages/marcas/hooks/useMarcasCatalogo.js
import { useState, useEffect } from 'react';
import useDebounce from '../../../hooks/useDebounce';
import { getMarcas } from '../services/marcasService';

export const useMarcasCatalogo = () => {
  const [marcas, setMarcas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  const cargarMarcas = async () => {
    let lista = await getMarcas();
    if (!Array.isArray(lista)) lista = lista && lista.data ? lista.data : (lista || []);

    if (debouncedSearch) {
      lista = (lista || []).filter((m) => (m.nombre || '').toLowerCase().includes(debouncedSearch.toLowerCase()));
    }

    if (sortBy === 'nombre') {
      lista.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
    } else if (sortBy === '-nombre') {
      lista.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || ''));
    }

    setMarcas(lista || []);
  };

  useEffect(() => {
    cargarMarcas();
  }, [debouncedSearch, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('');
  };

  return { marcas, searchQuery, setSearchQuery, sortBy, setSortBy, clearFilters };
};
