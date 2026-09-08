// src/pages/domicilios/hooks/useMisDomicilios.js
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getMisPedidosDomicilio } from '../services/domiciliosService';

const BADGE_CLASSES = {
  entregado: 'bg-success',
  enviado: 'bg-primary',
  recibido: 'bg-primary',
  aprobado: 'bg-info text-dark',
  pendiente: 'bg-warning text-dark',
  cancelado: 'bg-danger',
  anulado: 'bg-danger',
};

export const getBadgeClass = (estado) => BADGE_CLASSES[String(estado || '').toLowerCase()] || 'bg-secondary';

const ITEMS_PER_PAGE = 5;

// El backend devuelve el Domicilio con su Pedido anidado (as: 'pedido');
// se aplana aquí para que la vista siga trabajando con `ventaId`/`tarifa`
// igual que antes, sin que el resto del componente sepa de la anidación.
const mapDomicilio = (d) => ({
  id: d.id,
  ventaId: d.pedido?.id ?? d.pedidoId,
  direccion: d.direccion || '',
  direccion2: d.direccion2 || '',
  barrio: d.barrio || '',
  estado: d.estado || 'Pendiente',
  tarifa: d.tarifaAplicada ?? d.costo ?? 0,
  repartidor: d.repartidor || null,
});

export const useMisDomicilios = () => {
  const { user } = useAuth();
  const [domicilios, setDomicilios] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const cargarDatos = async () => {
      if (user) {
        const misDomicilios = (await getMisPedidosDomicilio()) || [];
        setDomicilios(misDomicilios.map(mapDomicilio));
      }
    };
    cargarDatos();
  }, [user]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return domicilios.filter(d => {
      if (filter !== 'Todos' && String(d.estado).toLowerCase() !== filter) return false;
      if (!q) return true;

      const fields = [d.id, d.ventaId, d.direccion, d.estado].filter(Boolean).join(' ').toLowerCase();
      return fields.includes(q);
    });
  }, [domicilios, search, filter]);

  const getVentaInfo = (domicilio) => (domicilio.ventaId ? { id: domicilio.ventaId } : null);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const clearFilters = () => {
    setSearch('');
    setFilter('Todos');
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return {
    user,
    search,
    setSearch,
    filter,
    setFilter,
    clearFilters,
    filtered,
    paginatedItems,
    currentPage,
    setCurrentPage,
    totalPages,
    getVentaInfo,
  };
};
