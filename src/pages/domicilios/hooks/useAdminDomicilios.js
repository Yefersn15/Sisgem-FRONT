// src/pages/domicilios/hooks/useAdminDomicilios.js
import { useState, useEffect, useMemo } from 'react';
import {
  getDomicilios,
  saveDomicilio,
  updateDomicilioEstado,
  asignarRepartidor,
  editarRepartidor,
} from '../services/domiciliosService';
import { getVentas, getVentaById, getUsuarios, exportToExcel, importDomicilios, formatPrice } from '../../../services/dataService';
import { openPrintVoucher } from '../../../services/printService';
import { getSiguientesEstadosDomicilio, isEstadoFinalDomicilio, normalizeNumber } from './domicilioEstados';

export const useAdminDomicilios = () => {
  const [domicilios, setDomicilios] = useState([]);
  const [repartidoresList, setRepartidoresList] = useState([]);
  const [selectedRepartidorId, setSelectedRepartidorId] = useState('');
  const [search, setSearch] = useState('');
  const [ventas, setVentas] = useState([]);
  const [filter, setFilter] = useState('Todos');
  const [showRepartidorModal, setShowRepartidorModal] = useState(false);
  const [currentVentaId, setCurrentVentaId] = useState(null);
  const [repartidorForm, setRepartidorForm] = useState({ nombre: '', telefono: '', tipoVehiculo: '', placa: '' });

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

  const openRepartidorModal = (ventaId) => {
    const dom = domicilios.find(d => String(d.ventaId) === String(ventaId));
    setCurrentVentaId(ventaId);
    const rep = dom?.repartidor;
    setRepartidorForm({
      nombre: (typeof rep === 'object' ? rep?.nombre : rep) || '',
      telefono: (typeof rep === 'object' ? rep?.telefono : dom?.telefono_repartidor) || '',
      tipoVehiculo: (typeof rep === 'object' ? rep?.tipoVehiculo : '') || '',
      placa: (typeof rep === 'object' ? rep?.placa : '') || '',
      tarifa: (dom?.tarifaAplicada ?? dom?.tarifa_aplicada ?? dom?.tarifa) ?? 0
    });
    setSelectedRepartidorId('');
    setShowRepartidorModal(true);
  };

  const handleRepartidorInput = (e) => {
    const { name, value } = e.target;
    setRepartidorForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectRepartidor = (e) => {
    const id = e.target.value;
    setSelectedRepartidorId(id);
    if (!id) {
      setRepartidorForm({ nombre: '', telefono: '', tipoVehiculo: '', placa: '', tarifa: repartidorForm.tarifa });
      return;
    }
    const user = repartidoresList.find(r => String(r.id || r._id) === String(id));
    if (user) {
      setRepartidorForm({ nombre: user.nombre || '', telefono: user.telefono || '', tipoVehiculo: user.tipoVehiculo || '', placa: user.placa || '', tarifa: repartidorForm.tarifa });
    }
  };

  const handleSaveRepartidor = async () => {
    if (!currentVentaId) return;
    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert('No hay sesión activa. Por favor, inicia sesión nuevamente.');
      return;
    }
    const { nombre, telefono, tipoVehiculo, placa, tarifa } = repartidorForm;
    if (!nombre || !telefono) return alert('Nombre y teléfono son obligatorios');

    const dom = domicilios.find(d => String(d.ventaId) === String(currentVentaId));
    let res = null;
    const payload = {
      repartidor: {
        nombre,
        telefono,
        tipoVehiculo: tipoVehiculo || '',
        placa: placa || ''
      },
      tarifa: tarifa !== undefined ? parseFloat(tarifa) : undefined
    };
    if (selectedRepartidorId) payload.repartidorId = selectedRepartidorId;

    try {
      if (dom?.repartidor?.nombre) {
        res = await editarRepartidor(currentVentaId, payload);
      } else {
        res = await asignarRepartidor(currentVentaId, payload);
      }
    } catch (err) {
      console.error('Error asignando repartidor:', err);
      alert('No se puede asignar/editar repartidor: ' + (err?.message || err));
      return;
    }
    if (!res) {
      alert('No se puede asignar/editar repartidor: el pedido puede requerir aprobación previa o no existe un domicilio creado.');
      return;
    }
    try {
      const venta = ventas.find(v => String(v.id) === String(currentVentaId));
      if (venta && res) openPrintVoucher(venta, res, { forBag: true });
    } catch (e) {}
    setShowRepartidorModal(false);
    setCurrentVentaId(null);
    cargarDatos();
  };

  const handleCambiarEstado = async (ventaId, nextState) => {
    const dom = domicilios.find(d => String(d.ventaId) === String(ventaId));
    const estadoActual = dom?.estado;

    if (estadoActual && isEstadoFinalDomicilio(estadoActual)) {
      alert(`No se puede cambiar el estado: El domicilio ya está en estado "${estadoActual}" que es un estado final.`);
      return;
    }
    const siguientes = getSiguientesEstadosDomicilio(estadoActual);
    if (estadoActual && !siguientes.includes(nextState)) {
      alert(`No se puede cambiar de "${estadoActual}" a "${nextState}".\n\nEstados válidos siguientes: ${siguientes.join(', ') || 'Ninguno'}`);
      return;
    }
    if ((nextState === 'en_preparacion' || nextState === 'asignado') && (!dom?.repartidor || !dom.repartidor.nombre)) {
      alert('Debe asignar un repartidor antes de cambiar el estado a En Preparación o Asignado.');
      return;
    }
    try {
      await updateDomicilioEstado(ventaId, nextState);
      await cargarDatos();
    } catch (error) {
      alert('Error al cambiar estado: ' + error.message);
    }
  };

  const handleConvertirAVenta = async (ventaId) => {
    if (!confirm('¿Convertir pedido a venta?')) return;
    await updateDomicilioEstado(ventaId, 'entregado', true);
    cargarDatos();
  };

  const handleEditarTarifa = async (ventaId, tarifaActual) => {
    const nuevaTarifa = prompt('Ingrese la tarifa de envío:', tarifaActual || '0');
    if (nuevaTarifa === null) return;
    const tarifaNum = parseFloat(String(nuevaTarifa).replace(/[^0-9.\-]/g, ''));
    if (isNaN(tarifaNum) || tarifaNum < 0) {
      alert('Tarifa inválida. Ingrese un número válido.');
      return;
    }
    const dom = domicilios.find(d => String(d.ventaId) === String(ventaId));
    if (!dom) {
      alert('No se encontró el domicilio para la venta');
      return;
    }
    try {
      dom.tarifa = tarifaNum;
      const res = await saveDomicilio(dom);
      alert('Tarifa guardada correctamente');
      await cargarDatos();
      return res;
    } catch (err) {
      alert('Error guardando tarifa: ' + (err?.message || err));
    }
  };

  const handleNotas = (ventaId, notasActuales) => {
    const nuevasNotas = prompt('Notas para el domicilio (se guardará como nota de admin):', notasActuales || '');
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
        alert('No se pudo obtener la información de la venta para imprimir');
      }
    } catch (err) {
      console.error('Error al imprimir:', err);
      alert('Error al generar el voucher: ' + (err.message || err));
    }
  };

  const handleWhatsapp = (dom) => {
    const target = dom.repartidor?.telefono ? normalizeNumber(dom.repartidor.telefono) : normalizeNumber(dom.telefono);
    if (target) window.open(`https://wa.me/${target}`, '_blank');
    else alert('Teléfono inválido para WhatsApp');
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
      alert('Importación de domicilios completada');
      cargarDatos();
    }, (err) => {
      alert('Error al importar domicilios: ' + (err?.message || err));
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
    selectedRepartidorId,
    search,
    setSearch,
    filter,
    setFilter,
    clearFilters,
    showRepartidorModal,
    setShowRepartidorModal,
    repartidorForm,
    openRepartidorModal,
    handleRepartidorInput,
    handleSelectRepartidor,
    handleSaveRepartidor,
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
