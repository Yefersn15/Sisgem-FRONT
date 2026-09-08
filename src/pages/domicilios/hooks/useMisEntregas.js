// src/pages/domicilios/hooks/useMisEntregas.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getMisEntregas, cambiarEstadoMiEntrega } from '../services/domiciliosService';
import { getSiguientesEstadosDomicilio, isEstadoFinalDomicilio } from './domicilioEstados';

const BADGE_CLASSES = {
  pendiente: 'bg-warning text-dark',
  asignado: 'bg-info text-dark',
  en_camino: 'bg-primary',
  entregado: 'bg-success',
  cancelado: 'bg-danger',
};

export const getBadgeClass = (estado) => BADGE_CLASSES[String(estado || '').toLowerCase()] || 'bg-secondary';

const mapEntrega = (d) => ({
  id: d.id,
  ventaId: d.pedido?.id ?? d.pedidoId,
  direccion: d.direccion || '',
  direccion2: d.direccion2 || '',
  barrio: d.barrio || '',
  ciudad: d.ciudad || '',
  telefono: d.telefono || d.pedido?.usuario?.telefono || '',
  estado: d.estado || 'Pendiente',
  tarifa: d.tarifaAplicada ?? d.costo ?? 0,
  clienteNombre: d.pedido?.usuario?.nombre || '',
  metodoPago: d.pedido?.metodoPago || d.pedido?.metodo_pago || '',
  total: d.pedido?.total ?? 0,
});

const ITEMS_PER_PAGE = 5;

export const useMisEntregas = () => {
  const { user } = useAuth();
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('activas');
  const [currentPage, setCurrentPage] = useState(1);
  const [actualizandoId, setActualizandoId] = useState(null);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const data = await getMisEntregas();
    setEntregas(data.map(mapEntrega));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entregas.filter((e) => {
      if (filter === 'activas' && isEstadoFinalDomicilio(e.estado)) return false;
      if (filter === 'finalizadas' && !isEstadoFinalDomicilio(e.estado)) return false;
      if (!q) return true;
      const fields = [e.id, e.ventaId, e.direccion, e.barrio, e.clienteNombre, e.estado].filter(Boolean).join(' ').toLowerCase();
      return fields.includes(q);
    });
  }, [entregas, search, filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const clearFilters = () => {
    setSearch('');
    setFilter('activas');
  };

  const cambiarEstado = async (id, estado) => {
    setError('');
    setActualizandoId(id);
    try {
      await cambiarEstadoMiEntrega(id, estado);
      await cargar();
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el estado de la entrega');
    } finally {
      setActualizandoId(null);
    }
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return {
    user,
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    clearFilters,
    paginatedItems,
    currentPage,
    setCurrentPage,
    totalPages,
    cambiarEstado,
    actualizandoId,
    error,
    getSiguientesEstados: getSiguientesEstadosDomicilio,
  };
};
