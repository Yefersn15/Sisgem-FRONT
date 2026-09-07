// src/pages/ventas/hooks/useVentasAdmin.js
import { useState, useEffect } from 'react';
import useDebounce from '../../../hooks/useDebounce';
import { getVentas, updateVenta } from '../services/ventasService';
import { getUsuarios } from '../../../services/api/usuarios.api';
import { getProductos } from '../../../services/api/productos.api';
import { exportToExcel } from '../../../services/api/utils';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';

const ITEMS_PER_PAGE = 5;

export const useVentasAdmin = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [ventas, setVentas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [filterEstado, setFilterEstado] = useState('');
  const [filterMetodo, setFilterMetodo] = useState('');
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300);
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

  const cargarVentas = async () => {
    let lista = await getVentas();
    if (filterEstado) lista = lista.filter((v) => v.estadoVenta === filterEstado);
    if (filterMetodo) lista = lista.filter((v) => v.metodoPago === filterMetodo);
    if (debounced) {
      const q = debounced.toLowerCase();
      lista = lista.filter((v) =>
        String(v.id).includes(q) ||
        (v.usuarioNombre || '').toLowerCase().includes(q) ||
        (v.telefono || '').includes(q)
      );
    }
    setVentas(lista);
    setCurrentPage(1);
  };

  useEffect(() => {
    cargarVentas();
    cargarUsuarios();
    cargarProductos();
  }, [debounced, filterEstado, filterMetodo]);

  const anularVenta = async (id) => {
    if (!(await confirm('¿Anular esta venta?'))) return;
    try {
      await updateVenta(id, { estado_venta: 'cancelado' });
      cargarVentas();
    } catch (err) {
      toast.error(err.message || 'Error al anular');
    }
  };

  const aprobarVenta = async (id) => {
    try {
      await updateVenta(id, { estado_venta: 'completada' });
      cargarVentas();
    } catch (err) {
      toast.error(err.message || 'Error al aprobar');
    }
  };

  const generarReporte = () => {
    const data = ventas.map((v) => ({
      ID: v.id,
      Fecha: new Date(v.fechaVenta).toLocaleString(),
      Usuario: v.usuarioNombre || '—',
      'Método Pago': v.metodoPago,
      Subtotal: v.subtotal,
      Total: v.total,
      Estado: v.estado,
      Delivery: v.delivery ? 'Sí' : 'No',
      Dirección: v.direccion || '',
      Teléfono: v.telefono || '',
      Notas: v.observaciones || '',
    }));
    exportToExcel(data, 'reporte_ventas.xlsx');
  };

  const clearFilters = () => {
    setFilterEstado('');
    setFilterMetodo('');
    setQuery('');
  };

  const totalPages = Math.ceil(ventas.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const currentVentas = ventas.slice(indexOfLastItem - ITEMS_PER_PAGE, indexOfLastItem);

  return {
    ventas,
    usuarios,
    productos,
    filterEstado,
    setFilterEstado,
    filterMetodo,
    setFilterMetodo,
    query,
    setQuery,
    clearFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    currentVentas,
    cargarVentas,
    anularVenta,
    aprobarVenta,
    generarReporte,
  };
};
