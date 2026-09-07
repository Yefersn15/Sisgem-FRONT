// src/pages/domicilios/hooks/useRepartidorAsignacion.js
import { useState } from 'react';
import { asignarRepartidor, editarRepartidor } from '../services/domiciliosService';
import { openPrintVoucher } from '../services/printService';

// Estado y acciones del modal de "asignar/editar repartidor" de un
// domicilio. Vive aparte de useAdminDomicilios porque es un flujo
// autocontenido (abrir modal -> elegir/llenar datos -> guardar); necesita
// leer `domicilios`/`ventas`/`repartidoresList` del hook principal y
// pedirle que recargue los datos (`cargarDatos`) tras guardar.
export const useRepartidorAsignacion = ({ domicilios, ventas, repartidoresList, cargarDatos, toast }) => {
  const [selectedRepartidorId, setSelectedRepartidorId] = useState('');
  const [showRepartidorModal, setShowRepartidorModal] = useState(false);
  const [currentVentaId, setCurrentVentaId] = useState(null);
  const [repartidorForm, setRepartidorForm] = useState({ nombre: '', telefono: '', tipoVehiculo: '', placa: '' });

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
      toast.error('No hay sesión activa. Por favor, inicia sesión nuevamente.');
      return;
    }
    const { nombre, telefono, tipoVehiculo, placa, tarifa } = repartidorForm;
    if (!nombre || !telefono) return toast.error('Nombre y teléfono son obligatorios');

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
      toast.error('No se puede asignar/editar repartidor: ' + (err?.message || err));
      return;
    }
    if (!res) {
      toast.error('No se puede asignar/editar repartidor: el pedido puede requerir aprobación previa o no existe un domicilio creado.');
      return;
    }
    try {
      const venta = ventas.find(v => String(v.id) === String(currentVentaId));
      if (venta && res) openPrintVoucher(venta, res, { forBag: true, onError: toast.error });
    } catch (e) {}
    setShowRepartidorModal(false);
    setCurrentVentaId(null);
    cargarDatos();
  };

  return {
    selectedRepartidorId,
    showRepartidorModal,
    setShowRepartidorModal,
    repartidorForm,
    openRepartidorModal,
    handleRepartidorInput,
    handleSelectRepartidor,
    handleSaveRepartidor,
  };
};
