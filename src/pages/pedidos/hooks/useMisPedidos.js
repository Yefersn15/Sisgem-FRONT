// src/pages/pedidos/hooks/useMisPedidos.js
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getMisPedidos } from '../services/pedidosService';

const getEstadoEfectivo = (registro) => registro.estado_pedido || registro.estado_venta || '';

const BADGE_CLASSES = {
  pendiente: 'bg-warning text-dark',
  aprobado: 'bg-info',
  asignado: 'bg-primary',
  en_camino: 'bg-primary',
  entregado: 'bg-success',
  recibido: 'bg-success',
  cancelado: 'bg-danger',
  anulado: 'bg-secondary',
  completada: 'bg-success',
};

export const getBadgeClass = (estado) => BADGE_CLASSES[estado] || 'bg-secondary';

const ITEMS_PER_PAGE = 5;

export const useMisPedidos = () => {
  const { user } = useAuth();
  const [todosRegistros, setTodosRegistros] = useState([]);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [metodoFilter, setMetodoFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      if (user) {
        try {
          const data = await getMisPedidos();
          setTodosRegistros(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error('Error cargando pedidos:', err);
          setTodosRegistros([]);
        }
      } else {
        setTodosRegistros([]);
      }
    };
    load();
  }, [user]);

  const estados = useMemo(() => {
    const s = todosRegistros.map((p) => getEstadoEfectivo(p));
    return [...new Set(s)].filter(Boolean);
  }, [todosRegistros]);

  const metodos = useMemo(() => [...new Set(todosRegistros.map((p) => p.metodo_pago))], [todosRegistros]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return todosRegistros
      .filter((p) => {
        const estadoEfectivo = getEstadoEfectivo(p);
        if (estadoFilter && estadoEfectivo !== estadoFilter) return false;
        if (metodoFilter && p.metodo_pago !== metodoFilter) return false;
        if (!q) return true;
        const fields = [p.id, p.direccion?.direccion, p.telefono_contacto, p.metodo_pago, estadoEfectivo]
          .filter(Boolean).join(' ').toLowerCase();
        return fields.includes(q);
      })
      .sort((a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido));
  }, [todosRegistros, search, estadoFilter, metodoFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, estadoFilter, metodoFilter]);

  const clearFilters = () => {
    setSearch('');
    setEstadoFilter('');
    setMetodoFilter('');
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return {
    user,
    search,
    setSearch,
    estadoFilter,
    setEstadoFilter,
    metodoFilter,
    setMetodoFilter,
    estados,
    metodos,
    filtered,
    paginatedItems,
    currentPage,
    setCurrentPage,
    totalPages,
    clearFilters,
    getEstadoEfectivo,
  };
};
