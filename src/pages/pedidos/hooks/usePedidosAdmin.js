// src/pages/pedidos/hooks/usePedidosAdmin.js
import { useState, useEffect, useMemo } from 'react';
import { getPedidos, cambiarEstadoPedido, aprobarSolicitudAbono, rechazarAbono } from '../services/pedidosService';
import { getUsuarios } from '../../../services/api/usuarios.api';
import { getProductos } from '../../../services/api/productos.api';
import { useToast } from '../../../context/ToastContext';
import { useConfirm, usePrompt } from '../../../context/ConfirmContext';

const ITEMS_PER_PAGE = 20;

export const usePedidosAdmin = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const prompt = usePrompt();
  const [pedidos, setPedidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [filterEstado, setFilterEstado] = useState('');
  const [filterMetodo, setFilterMetodo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const cargarUsuarios = async () => {
    const lista = await getUsuarios();
    setUsuarios(lista);
  };

  const cargarProductos = async () => {
    try {
      let lista = await getProductos();
      if (!Array.isArray(lista)) lista = lista?.data || lista || [];
      setProductos(lista);
    } catch (e) {
      console.error('Error cargando productos:', e);
      setProductos([]);
    }
  };

  const cargarPedidos = async () => {
    const lista = await getPedidos();
    setPedidos(lista);
    setCurrentPage(1);
  };

  useEffect(() => {
    cargarPedidos();
    cargarUsuarios();
    cargarProductos();
  }, []);

  const handleCambiarEstado = async (id, nuevoEstado) => {
    await cambiarEstadoPedido(id, nuevoEstado);
    cargarPedidos();
  };

  const handleAprobarSolicitudAbono = async (pedidoId, metodoPago) => {
    const esAbono = metodoPago === 'Abono';
    const mensaje = esAbono
      ? '¿Aprobar este pedido por Abono?\n\nEl cliente podrá hacer pagos parciales.\nEl stock se reducirá al entregar.'
      : '¿Aprobar este pedido para envío?\n\nEl stock se reducirá al entregar.';
    if (!(await confirm(mensaje))) return;
    try {
      await aprobarSolicitudAbono(pedidoId);
      cargarPedidos();
    } catch (e) {
      toast.error('Error aprobando: ' + (e?.message || e));
    }
  };

  const handleRechazarAbono = async (pedidoId) => {
    const motivo = await prompt('Ingrese el motivo del rechazo (opcional):', { title: 'Motivo del rechazo' });
    if (motivo === null) return;
    try {
      await rechazarAbono(pedidoId, motivo);
      cargarPedidos();
    } catch (e) {
      toast.error('Error rechazando solicitud: ' + (e?.message || e));
    }
  };

  const filtered = useMemo(() => {
    let list = pedidos;
    if (filterEstado) list = list.filter((p) => p.estadoPedido === filterEstado);
    if (filterMetodo) list = list.filter((p) => p.metodoPago === filterMetodo);
    if (busqueda) {
      const q = busqueda.toLowerCase();
      list = list.filter((p) => String(p.id).includes(q) || p.usuarioNombre?.toLowerCase().includes(q));
    }
    return list.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [pedidos, filterEstado, filterMetodo, busqueda]);

  const clearFilters = () => {
    setBusqueda('');
    setFilterEstado('');
    setFilterMetodo('');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return {
    usuarios,
    productos,
    filterEstado,
    setFilterEstado,
    filterMetodo,
    setFilterMetodo,
    busqueda,
    setBusqueda,
    clearFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    currentItems,
    cargarPedidos,
    handleCambiarEstado,
    handleAprobarSolicitudAbono,
    handleRechazarAbono,
  };
};
