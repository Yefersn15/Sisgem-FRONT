import React, { useState, useEffect } from 'react';
import { getVentaById, getTotalPagadoByVenta, getTotalRecibidoByVenta, formatPrice } from '../../services/dataService';

const PagoForm = ({ initial = {}, onSubmit, onCancel }) => {
  const isAbono = Boolean(initial.ventaId);
  const [form, setForm] = useState({
    ventaId: initial.ventaId || '',
    fecha: initial.fecha ? new Date(initial.fecha).toISOString().slice(0,16) : new Date().toISOString().slice(0,16),
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
        const recibido = await getTotalRecibidoByVenta(form.ventaId) || 0;
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
      // prevenir que el usuario ingrese un monto mayor a la deuda cuando es abono
      if (isAbono && deuda !== null) {
        const num = parseFloat(value);
        if (!isNaN(num) && num > deuda) {
          newValue = String(Math.round(deuda));
        }
      }
      // siempre usar enteros
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
    // Si es abono, monto no puede superar la deuda restante
    if (isAbono && deuda !== null) {
      const montoVal = parseFloat(form.monto) || 0;
      if (montoVal > deuda) newErrors.monto = `El monto no puede ser mayor a la deuda (${deuda.toFixed(2)})`;
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const metodoNormalizado = (form.metodo || '').toLowerCase();
    const payload = {
      ...form,
      monto: Math.round(parseFloat(form.monto) || 0),
      fecha: isAbono ? new Date().toISOString() : new Date(form.fecha).toISOString(),
      metodo: metodoNormalizado === 'abono' ? 'efectivo' : metodoNormalizado,
      tipo: metodoNormalizado === 'abono' ? 'abono' : 'pago_total',
      estado: (form.estado || '').toLowerCase()
    };
    onSubmit && onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label">Venta ID *</label>
          <input
            name="ventaId"
            className={`form-control ${errors.ventaId ? 'is-invalid' : ''}`}
            value={form.ventaId}
            onChange={handleChange}
            readOnly={isAbono}
            disabled={isAbono}
          />
          {errors.ventaId && <div className="invalid-feedback">{errors.ventaId}</div>}
        </div>
        <div className="col-md-4">
          <label className="form-label">Fecha *</label>
          <input
            type="datetime-local"
            name="fecha"
            className={`form-control ${errors.fecha ? 'is-invalid' : ''}`}
            value={form.fecha}
            onChange={handleChange}
            readOnly={isAbono}
            disabled={isAbono}
          />
          {errors.fecha && <div className="invalid-feedback">{errors.fecha}</div>}
        </div>
        <div className="col-md-4">
          <label className="form-label">Monto *</label>
          <input
            type="number"
            step="1"
            name="monto"
            className={`form-control ${errors.monto ? 'is-invalid' : ''}`}
            value={form.monto}
            onChange={handleChange}
            max={isAbono && deuda !== null && deuda > 0 ? deuda : undefined}
          />
          {errors.monto && <div className="invalid-feedback">{errors.monto}</div>}
          {isAbono && deuda !== null && (
            <div className="form-text">Deuda restante: <strong>{formatPrice(deuda)}</strong></div>
          )}
        </div>
        <div className="col-md-4">
          <label className="form-label">Método</label>
          <select name="metodo" className="form-select" value={form.metodo} onChange={handleChange}>
            <option>Efectivo</option>
            <option>Transferencia</option>
            <option>Abono</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Estado</label>
          <select name="estado" className="form-select" value={form.estado} onChange={handleChange} disabled={isAbono}>
            <option>Pendiente</option>
            <option>Aplicado</option>
            <option>Rechazado</option>
            <option>Anulado</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Notas</label>
          <textarea name="notas" className="form-control" value={form.notas} onChange={handleChange} />
        </div>
      </div>
      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary">Guardar</button>
      </div>
    </form>
  );
};

export default PagoForm;