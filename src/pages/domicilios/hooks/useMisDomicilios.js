// src/pages/domicilios/hooks/useMisDomicilios.js
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getDomicilios } from '../services/domiciliosService';
import { getVentas } from '../../../services/api/pedidos.api';

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

export const useMisDomicilios = () => {
  const { user } = useAuth();
  const [domicilios, setDomicilios] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');

  useEffect(() => {
    const cargarDatos = async () => {
      if (user) {
        const todasLasVentas = (await getVentas()) || [];
        const ventasDelUsuario = todasLasVentas.filter(v => v.usuarioId === user.id);
        setVentas(ventasDelUsuario);

        const ventaIds = ventasDelUsuario.map(v => v.id);

        const todosDomicilios = (await getDomicilios()) || [];
        const domiciliosDelUsuario = todosDomicilios.filter(d =>
          ventaIds.includes(d.ventaId) || ventaIds.includes(d.id)
        );
        setDomicilios(domiciliosDelUsuario);
      }
    };
    cargarDatos();
  }, [user]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return domicilios.filter(d => {
      if (filter !== 'Todos' && d.estado !== filter) return false;
      if (!q) return true;

      const venta = ventas.find(v => String(v.id) === String(d.ventaId) || String(v.id) === String(d.id));
      const fields = [d.id, d.direccion, d.estado, venta?.id].filter(Boolean).join(' ').toLowerCase();
      return fields.includes(q);
    });
  }, [domicilios, ventas, search, filter]);

  const getVentaInfo = (domicilio) =>
    ventas.find(v => String(v.id) === String(domicilio.ventaId) || String(v.id) === String(domicilio.id));

  const clearFilters = () => {
    setSearch('');
    setFilter('Todos');
  };

  return { user, search, setSearch, filter, setFilter, clearFilters, filtered, getVentaInfo };
};
