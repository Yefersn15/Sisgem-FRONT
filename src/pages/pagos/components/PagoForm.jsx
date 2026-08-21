import React, { useState } from 'react';
import { formatPrice } from '../../../services/api/utils';
import { usePagoForm } from '../hooks/usePagoForm';

const PagoForm = ({ initial = {}, onSubmit, onCancel }) => {
  const { isAbono, form, errors, deuda, handleChange, validate, buildPayload } = usePagoForm(initial);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    if (!onSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit(buildPayload());
    } finally {
      setSubmitting(false);
    }
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
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? (<><span className="spinner-border spinner-border-sm me-2" role="status"></span>Guardando...</>) : 'Guardar'}
        </button>
      </div>
    </form>
  );
};

export default PagoForm;
