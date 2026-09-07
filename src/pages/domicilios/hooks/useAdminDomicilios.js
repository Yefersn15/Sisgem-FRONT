// src/pages/domicilios/hooks/useAdminDomicilios.js
import { useState, useEffect, useMemo } from 'react';
import {
  getDomicilios,
  saveDomicilio,
  updateDomicilioEstado,
} from '../services/domiciliosService';
import { getVentas, getVentaById } from '../../../services/api/pedidos.api';
import { getUsuarios } from '../../../services/api/usuarios.api';
import { exportToExcel, formatPrice } from '../../../services/api/utils';
import { importDomicilios } from '../../../services/api/domicilios.api';
import { openPrintVoucher } from '../services/printService';
import { getSiguientesEstadosDomicilio, isEstadoFinalDomicilio, normalizeNumber } from './domicilioEstados';
import { useToast } from '../../../context/ToastContext';
import { useConfirm, usePrompt } from '../../../context/ConfirmContext';
import { useRepartidorAsignacion } from './useRepartidorAsignacion';

export const useAdminDomicilios = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const prompt = usePrompt();
  const [domicilios, setDomicilios] = useState([]);
  const [repartidoresList, setRepartidoresList] = useState([]);
  const [search, setSearch] = useState('');
  const [ventas, setVentas] = useState([]);
  const [filter, setFilter] = useState('Todos');

  const cargarDatos = async () => {
    const doms = (await getDomicilios()) || [];
    setDomicilios(doms);
    setVentas((await getVentas()) || []);
    try {
      const users = await getUsuarios();
      const reps = Array.isArray(users) ? users.filter(u => {
        const rn = (u.rol_nombre || '').toString().toUpperCase();
        return rn.includes('REPART') || rn === 'EMPLEADO' || rn === 'DOMICILIARIO';
      }) : [];
      setRepartidoresList(reps);
    } catch (e) {
      setRepartidoresList([]);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const repartidorAsignacion = useRepartidorAsignacion({ domicilios, ventas, repartidoresList, cargarDatos, toast });

  const handleCambiarEstado = async (ventaId, nextState) => {
    const dom = domicilios.find(d => String(d.ventaId) === String(ventaId));
    const estadoActual = dom?.estado;

    if (estadoActual && isEstadoFinalDomicilio(estadoActual)) {
      toast.error(`No se puede cambiar el estado: El domicilio ya está en estado "${estadoActual}" que es un estado final.`);
      return;
    }
    const siguientes = getSiguientesEstadosDomicilio(estadoActual);
    if (estadoActual && !siguientes.includes(nextState)) {
      toast.error(`No se puede cambiar de "${estadoActual}" a "${nextState}". Estados válidos siguientes: ${siguientes.join(', ') || 'Ninguno'}`);
      return;
    }
    if ((nextState === 'en_preparacion' || nextState === 'asignado') && (!dom?.repartidor || !dom.repartidor.nombre)) {
      toast.error('Debe asignar un repartidor antes de cambiar el estado a En Preparación o Asignado.');
      return;
    }
    try {
      await updateDomicilioEstado(ventaId, nextState);
      await cargarDatos();
    } catch (error) {
      toast.error('Error al cambiar estado: ' + error.message);
    }
  };

  const handleConvertirAVenta = async (ventaId) => {
    if (!(await confirm('¿Convertir pedido a venta?'))) return;
    await updateDomicilioEstado(ventaId, 'entregado', true);
    cargarDatos();
  };

  const handleEditarTarifa = async (ventaId, tarifaActual) => {
    const nuevaTarifa = await prompt('Ingrese la tarifa de envío:', { title: 'Tarifa de envío', defaultValue: tarifaActual || '0' });
    if (nuevaTarifa === null) return;
    const tarifaNum = parseFloat(String(nuevaTarifa).replace(/[^0-9.\-]/g, ''));
    if (isNaN(tarifaNum) || tarifaNum < 0) {
      toast.error('Tarifa inválida. Ingrese un número válido.');
      return;
    }
    const dom = domicilios.find(d => String(d.ventaId) === String(ventaId));
    if (!dom) {
      toast.error('No se encontró el domicilio para la venta');
      return;
    }
    try {
      dom.tarifa = tarifaNum;
      const res = await saveDomicilio(dom);
      toast.success('Tarifa guardada correctamente');
      await cargarDatos();
      return res;
    } catch (err) {
      toast.error('Error guardando tarifa: ' + (err?.message || err));
    }
  };

  const handleNotas = async (ventaId, notasActuales) => {
    const nuevasNotas = await prompt('Notas para el domicilio (se guardará como nota de admin):', { title: 'Notas del domicilio', defaultValue: notasActuales || '' });
    if (nuevasNotas !== null) {
      const dom = domicilios.find(d => String(d.ventaId) === String(ventaId));
      if (dom) {
        dom.notas = nuevasNotas;
        dom.notasAutor = 'admin';
        saveDomicilio(dom);
        cargarDatos();
      }
    }
  };

  const handleImprimir = async (dom) => {
    try {
      let ventaData = dom.venta;
      if (!ventaData || !ventaData.id) {
        ventaData = await getVentaById(dom.pedidoId);
      }
      if (ventaData && ventaData.id) {
        await openPrintVoucher(ventaData, dom, { forBag: true });
      } else {
        toast.error('No se pudo obtener la información de la venta para imprimir');
      }
    } catch (err) {
      console.error('Error al imprimir:', err);
      toast.error('Error al generar el voucher: ' + (err.message || err));
    }
  };

  const handleWhatsapp = (dom) => {
    const target = dom.repartidor?.telefono ? normalizeNumber(dom.repartidor.telefono) : normalizeNumber(dom.telefono);
    if (target) window.open(`https://wa.me/${target}`, '_blank');
    else toast.error('Teléfono inválido para WhatsApp');
  };

  const handleExportar = () => {
    const data = domicilios.map(d => ({
      Venta: d.ventaId,
      Dirección: `${d.direccion} ${d.direccion2 || ''}, ${d.barrio || ''}`,
      Tipo: d.tipo || '',
      Teléfono: normalizeNumber(d.telefono) || d.telefono,
      Estado: d.estado,
      Tarifa: formatPrice((d.tarifaAplicada ?? d.tarifa_aplicada ?? d.tarifa) ?? 0),
      Repartidor: d.repartidor?.nombre || '',
      TelRepartidor: normalizeNumber(d.repartidor?.telefono) || d.repartidor?.telefono || '',
      TipoVehiculo: d.repartidor?.tipoVehiculo || '',
      Placa: d.repartidor?.placa || '',
      Notas: d.notas,
      FechaAsignación: d.updatedAt ? new Date(d.updatedAt).toLocaleString() : ''
    }));
    exportToExcel(data, 'domicilios.xlsx');
  };

  const handleImport = (file) => {
    if (!file) return;
    importDomicilios(file, () => {
      toast.success('Importación de domicilios completada');
      cargarDatos();
    }, (err) => {
      toast.error('Error al importar domicilios: ' + (err?.message || err));
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return domicilios.filter(d => {
      if (filter !== 'Todos' && d.estado !== filter) return false;
      if (!q) return true;
      const venta = ventas.find(v => String(v.id) === String(d.ventaId));
      const fields = [d.ventaId, d.direccion, d.telefono, d.estado, venta?.metodoPago, venta?.id, venta?.usuarioNombre]
        .filter(Boolean).join(' ').toLowerCase();
      return fields.includes(q);
    });
  }, [domicilios, ventas, filter, search]);

  const domiciliosConVenta = useMemo(() => filtered.map(dom => {
    const pedidoId = dom.pedido?.id || dom.ventaId || dom.pedidoId;
    return { ...dom, pedidoId, venta: ventas.find(v => String(v.id) === String(pedidoId)) };
  }), [filtered, ventas]);

  const clearFilters = () => {
    setSearch('');
    setFilter('Todos');
  };

  return {
    domiciliosConVenta,
    repartidoresList,
    search,
    setSearch,
    filter,
    setFilter,
    clearFilters,
    ...repartidorAsignacion,
    handleCambiarEstado,
    handleConvertirAVenta,
    handleEditarTarifa,
    handleNotas,
    handleImprimir,
    handleWhatsapp,
    handleExportar,
    handleImport,
  };
};
