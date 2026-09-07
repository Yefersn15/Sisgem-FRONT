// src/hooks/useBusquedaOrden.js
import { useState, useMemo } from 'react';

export const ORDEN_OPCIONES = [
  { value: 'az', label: 'A-Z' },
  { value: 'za', label: 'Z-A' },
  { value: 'popularidad', label: 'Popularidad' },
];

// Búsqueda + orden en cliente para listados públicos ya cargados por
// completo (marcas, categorías): `getTexto` da el texto a buscar/ordenar
// alfabéticamente, `getPopularidad` el valor para el orden "Popularidad"
// (por defecto, cantidad de productos asociados). Tomado de
// Biblioteca_ReactVite (src/hooks/useBusquedaOrden.js).
export const useBusquedaOrden = (items, getTexto, getPopularidad) => {
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('az');

  const resultado = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    const filtrados = termino ? items.filter((item) => getTexto(item).toLowerCase().includes(termino)) : items;

    return [...filtrados].sort((a, b) => {
      if (orden === 'popularidad') return getPopularidad(b) - getPopularidad(a);
      const cmp = getTexto(a).localeCompare(getTexto(b), 'es', { sensitivity: 'base' });
      return orden === 'za' ? -cmp : cmp;
    });
  }, [items, busqueda, orden, getTexto, getPopularidad]);

  return { busqueda, setBusqueda, orden, setOrden, resultado };
};
