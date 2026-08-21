// src/pages/pagos/hooks/usePagosAdmin.js
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPagos, exportPagos, importPagos } from '../services/pagosService';
import { getPedidos, getVentas } from '../../../services/api/pedidos.api';
import { getDomicilios } from '../../../services/api/domicilios.api';

const calcularVentaConPagos = (venta, pagos) => {
  const shipping = parseFloat(venta.shipping) || 0;
  const totalVenta = (venta.subtotal || 0) + shipping;
  const pagosVenta = pagos.filter(p => String(p.ventaId) === String(venta.id));
  const totalPagado = pagosVenta
    .filter(p => {
      const estado = String(p.estado).toLowerCase();
      return estado === 'aplicado' || estado === 'pendiente';
    })
    .reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
  const saldoPendiente = Math.max(0, totalVenta - totalPagado);
  const estadoPago = saldoPendiente <= 0 ? 'Pagado' : 'Pendiente';
  return {
    ...venta,
    totalVenta,
    totalPagado,
    saldoPendiente,
    estadoPago,
    primerPagoId: pagosVenta.length > 0 ? pagosVenta[0].id : null,
    ultimoPago: pagosVenta.length > 0 ? pagosVenta[0].fecha : venta.fecha,
    shipping,
  };
};

export const usePagosAdmin = () => {
  const navigate = useNavigate();
  const [pedidosData, setPedidosData] = useState([]);
  const [ventasData, setVentasData] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [domicilios, setDomicilios] = useState([]);
  const [search, setSearch] = useState('');
  const [filterEstadoPago, setFilterEstadoPago] = useState('Todos');
  const [importStatus, setImportStatus] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    const cargarDatos = async () => {
      const pedidos = await getPedidos();
      const ventas = await getVentas();
      const pagosData = await getPagos();
      const domiciliosData = await getDomicilios();
      setPedidosData(pedidos);
      setVentasData(ventas);
      setPagos(pagosData);
      setDomicilios(domiciliosData);
    };
    cargarDatos();
  }, []);

  const todasLasVentas = useMemo(() => [...pedidosData, ...ventasData], [pedidosData, ventasData]);

  const ventasConPagos = useMemo(() => {
    const estadosExcluidos = ['rechazado', 'cancelado', 'anulado', 'pendiente'];
    const abonos = todasLasVentas.filter(venta => {
      const estadoLower = String(venta.estadoPedido || '').toLowerCase();
      if (estadosExcluidos.includes(estadoLower)) return false;
      return venta.metodoPago === 'Abono';
    });
    return abonos.map(venta => calcularVentaConPagos(venta, pagos));
  }, [todasLasVentas, pagos]);

  const filtered = useMemo(() => {
    let lista = ventasConPagos;
    if (filterEstadoPago !== 'Todos') {
      lista = lista.filter(v => v.estadoPago === filterEstadoPago);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      lista = lista.filter(v =>
        String(v.id).includes(q) ||
        (v.usuarioNombre || '').toLowerCase().includes(q) ||
        (v.metodoPago || '').toLowerCase().includes(q)
      );
    }
    return lista.sort((a, b) => new Date(b.ultimoPago) - new Date(a.ultimoPago));
  }, [ventasConPagos, filterEstadoPago, search]);

  const handleExport = () => exportPagos();

  const handleImport = (file) => {
    if (!file) return;
    importPagos(file, () => {
      setImportStatus({ message: 'Importación exitosa', type: 'success' });
      (async () => {
        const pedidos = await getPedidos();
        const ventas = await getVentas();
        const pagosData = await getPagos();
        setPedidosData(pedidos);
        setVentasData(ventas);
        setPagos(pagosData);
      })();
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setImportStatus({}), 3000);
    }, (err) => {
      setImportStatus({ message: 'Error importando: ' + (err?.message || err), type: 'danger' });
      setTimeout(() => setImportStatus({}), 5000);
    });
  };

  const handleAbonar = (venta) => {
    navigate('/admin/pagos/nuevo', { state: { ventaId: venta.id } });
  };

  const clearFilters = () => {
    setSearch('');
    setFilterEstadoPago('Todos');
  };

  return {
    domicilios,
    search,
    setSearch,
    filterEstadoPago,
    setFilterEstadoPago,
    clearFilters,
    importStatus,
    setImportStatus,
    fileInputRef,
    filtered,
    handleExport,
    handleImport,
    handleAbonar,
  };
};
