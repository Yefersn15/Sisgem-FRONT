// src/pages/domicilios/components/RepartidorModal.jsx
import React from 'react';

const RepartidorModal = ({
  repartidoresList,
  selectedRepartidorId,
  repartidorForm,
  onSelectRepartidor,
  onInputChange,
  onSave,
  onClose,
}) => (
  <div className="modal-backdrop d-flex align-items-center justify-content-center" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
    <div className="card p-3" style={{ width: 520 }}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Asignar / editar repartidor</h5>
        <button className="btn-close" onClick={onClose}></button>
      </div>
      <div className="mb-2">
        <label className="form-label">Seleccionar repartidor existente (opcional)</label>
        <select className="form-select" value={selectedRepartidorId} onChange={onSelectRepartidor}>
          <option value="">-- Seleccionar repartidor --</option>
          {repartidoresList.map(r => (
            <option key={r.id || r._id} value={r.id || r._id}>{r.nombre} {r.telefono ? `(${r.telefono})` : ''} - {r.rol_nombre || ''}</option>
          ))}
        </select>
      </div>

      <div className="mb-2">
        <label className="form-label">Nombre</label>
        <input className="form-control" name="nombre" value={repartidorForm.nombre} onChange={onInputChange} />
      </div>
      <div className="mb-2">
        <label className="form-label">Teléfono</label>
        <input className="form-control" name="telefono" value={repartidorForm.telefono} onChange={onInputChange} />
      </div>
      <div className="mb-2">
        <label className="form-label">Tipo de vehículo</label>
        <input className="form-control" name="tipoVehiculo" value={repartidorForm.tipoVehiculo} onChange={onInputChange} />
      </div>
      <div className="mb-3">
        <label className="form-label">Placa</label>
        <input className="form-control" name="placa" value={repartidorForm.placa} onChange={onInputChange} />
      </div>
      <div className="mb-3">
        <label className="form-label">Tarifa (opcional)</label>
        <input className="form-control" name="tarifa" value={repartidorForm.tarifa} onChange={onInputChange} type="number" step="0.01" />
      </div>
      <div className="d-flex justify-content-end gap-2">
        <button className="btn btn-secondary" onClick={onClose}>
          <i className="fas fa-times me-1"></i>Cancelar
        </button>
        <button className="btn btn-primary" onClick={onSave}>
          <i className="fas fa-save me-1"></i>Guardar
        </button>
      </div>
    </div>
  </div>
);

export default RepartidorModal;
