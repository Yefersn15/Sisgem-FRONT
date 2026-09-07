// src/pages/carrito/components/NuevaDireccionForm.jsx
import React from 'react';
import { telefonoEsValido, MENSAJE_TELEFONO_INVALIDO } from '../../../validations/telefono';

const NuevaDireccionForm = ({ newAddress, setNewAddress, onSave, onCancel }) => {
  const telefonoInvalido = newAddress.telefono.length > 0 && !telefonoEsValido(newAddress.telefono);

  return (
    <div className="card bg-light mb-3 p-3">
      <h6 className="mb-3">Nueva Dirección</h6>
      <div className="mb-2">
        <label className="form-label">Tipo de residencia *</label>
        <select
          className="form-select"
          value={newAddress.tipo}
          onChange={e => setNewAddress({ ...newAddress, tipo: e.target.value })}
        >
          <option value="casa">Casa</option>
          <option value="apartamento">Apartamento</option>
          <option value="oficina">Oficina</option>
        </select>
      </div>
      <div className="mb-2">
        <label className="form-label">Dirección *</label>
        <input
          type="text"
          className="form-control"
          value={newAddress.direccion}
          onChange={e => setNewAddress({ ...newAddress, direccion: e.target.value })}
          placeholder="Carrera 1 # 2-3"
        />
      </div>
      <div className="mb-2">
        <label className="form-label">Barrio</label>
        <input
          type="text"
          className="form-control"
          value={newAddress.barrio}
          onChange={e => setNewAddress({ ...newAddress, barrio: e.target.value })}
          placeholder="Barrio"
        />
      </div>
      <div className="mb-2">
        <label className="form-label">Teléfono</label>
        <input
          type="text"
          className={`form-control ${telefonoInvalido ? 'is-invalid' : ''}`}
          value={newAddress.telefono}
          onChange={e => setNewAddress({ ...newAddress, telefono: e.target.value })}
          placeholder="Teléfono"
        />
        {telefonoInvalido && <div className="invalid-feedback">{MENSAJE_TELEFONO_INVALIDO}</div>}
      </div>
      <div className="d-flex gap-2 mt-2">
        <button type="button" className="btn btn-outline-primary btn-sm" onClick={onSave} disabled={telefonoInvalido}>
          <i className="fas fa-check me-1"></i>Guardar Dirección
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default NuevaDireccionForm;
