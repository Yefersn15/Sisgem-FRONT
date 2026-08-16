// src/pages/pagos/hooks/usePagoForm.js
import { useState, useEffect } from 'react';
import { getVentaById, getTotalRecibidoByVenta } from '../services/pagosService';

export const usePagoForm = (initial = {}) => {
  const isAbono = Boolean(initial.ventaId);
  const [form, setForm] = useState({
    ventaId: initial.ventaId || '',
    fecha: initial.fecha ? new Date(initial.fecha).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    monto: initial.monto != null ? Math.round(Number(initial.monto) || 0) : 0,
    metodo: initial.metodo || 'Efectivo',
    estado: initial.estado || 'Pendiente',
    notas: initial.notas || ''
  });
  const [errors, setErrors] = useState({});
  const [deuda, setDeuda] = useState(null);

  useEffect(() => {
    (async () => {
      if (form.ventaId) {
        const venta = await getVentaById(form.ventaId);
        const subtotal = Math.round(parseFloat(venta?.subtotal || venta?.total || 0) || 0);
        const shipping = Math.round(parseFloat(venta?.shipping || 0) || 0);
        const total = subtotal + shipping;
        const recibido = (await getTotalRecibidoByVenta(form.ventaId)) || 0;
        setDeuda(Math.max(0, Math.round(total - recibido)));
      } else {
        setDeuda(null);
      }
    })();
  }, [form.ventaId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'monto') {
      if (isAbono && deuda !== null) {
        const num = parseFloat(value);
        if (!isNaN(num) && num > deuda) {
          newValue = String(Math.round(deuda));
        }
      }
      if (newValue !== '' && !isNaN(parseFloat(newValue))) {
        newValue = String(Math.round(parseFloat(newValue)));
      }
    }
    setForm(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.ventaId) newErrors.ventaId = 'ID de venta requerido';
    if (!form.fecha) newErrors.fecha = 'Fecha requerida';
    if (!form.monto || parseFloat(form.monto) <= 0) newErrors.monto = 'Monto debe ser mayor a 0';
    if (isAbono && deuda !== null) {
      const montoVal = parseFloat(form.monto) || 0;
      if (montoVal > deuda) newErrors.monto = `El monto no puede ser mayor a la deuda (${deuda.toFixed(2)})`;
    }
    return newErrors;
  };

  const buildPayload = () => ({
    ...form,
    monto: Math.round(parseFloat(form.monto) || 0),
    fecha: isAbono ? new Date().toISOString() : new Date(form.fecha).toISOString(),
    metodo: (form.metodo || '').toLowerCase(),
    tipo: isAbono ? 'abono' : 'pago_total',
    estado: isAbono ? 'aplicado' : (form.estado || '').toLowerCase()
  });

  return { isAbono, form, errors, deuda, handleChange, validate, buildPayload };
};
