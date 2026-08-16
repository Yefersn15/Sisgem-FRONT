// src/pages/pagos/hooks/useMisPagos.js
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getPagos } from '../services/pagosService';
import { getMisPedidos } from '../../../services/dataService';

export const getMetodoBadge = (metodo) => {
  switch (metodo) {
    case 'Efectivo': return 'bg-success';
    case 'Transferencia': return 'bg-info';
    case 'Abono': return 'bg-warning text-dark';
    default: return 'bg-secondary';
  }
};

export const getEstadoBadge = (estadoPago, esVenta, esAbono) => {
  if (esVenta && !esAbono) return 'bg-success';
  if (estadoPago === 'Pagado') return 'bg-success';
  return 'bg-warning text-dark';
};

export const useMisPagos = () => {
  const { user } = useAuth();
  const [pagos, setPagos] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [search, setSearch] = useState('');
  const [filterEstadoPago, setFilterEstadoPago] = useState('Todos');

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        const misPedidosData = await getMisPedidos();
        const todosPagos = await getPagos();

        setRegistros(misPedidosData);
        setPagos(todosPagos);
      };
      loadData();
    }
  }, [user]);

  const ventasConPagos = useMemo(() => {
    const estadosExcluidos = ['rechazado', 'cancelado', 'anulado'];
    const abonos = registros.filter(r =>
      (r.metodo_pago || r.metodoPago) === 'Abono' &&
      !estadosExcluidos.includes(String(r.estado_pedido || r.estadoPedido || '').toLowerCase())
    );
    return abonos.map(registro => {
      const subtotal = parseFloat(registro.subtotal) || 0;
      const shipping = parseFloat(registro.shipping) || 0;
      const totalVenta = subtotal + shipping;
      const metodoPago = registro.metodo_pago || registro.metodoPago || '';
      const esAbono = metodoPago === 'Abono';
      const esVenta = registro.es_venta || registro.esVenta;

      const pagosVenta = pagos.filter(p => String(p.ventaId) === String(registro._id || registro.id));
      const totalPagado = pagosVenta
        .filter(p => {
          const estado = String(p.estado).toLowerCase();
          return estado === 'aplicado' || estado === 'pendiente';
        })
        .reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);

      let saldoPendiente = 0;
      let estadoPago = 'Completado';

      if (esAbono) {
        saldoPendiente = Math.max(0, totalVenta - totalPagado);
        estadoPago = saldoPendiente <= 0 ? 'Pagado' : 'Pendiente';
      } else if (!esVenta) {
        saldoPendiente = totalVenta;
        estadoPago = 'Pendiente';
      }

      const primerPagoId = pagosVenta.length > 0 ? pagosVenta[0].id : null;
      return {
        ...registro,
        id: registro._id || registro.id,
        fecha: registro.fecha_pedido || registro.fecha || registro.createdAt || registro.updatedAt,
        totalVenta,
        metodoPago,
        esAbono,
        esVenta,
        totalPagado,
        saldoPendiente,
        estadoPago,
        primerPagoId
      };
    });
  }, [registros, pagos]);

  const filtered = useMemo(() => {
    let lista = ventasConPagos;
    if (filterEstadoPago !== 'Todos') {
      lista = lista.filter(v => v.estadoPago === filterEstadoPago);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      lista = lista.filter(v =>
        String(v.id).includes(q) ||
        (v.metodo_pago || '').toLowerCase().includes(q)
      );
    }
    return lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [ventasConPagos, filterEstadoPago, search]);

  const clearFilters = () => {
    setSearch('');
    setFilterEstadoPago('Todos');
  };

  return { user, search, setSearch, filterEstadoPago, setFilterEstadoPago, clearFilters, filtered };
};
