// src/pages/usuarios/components/RoleChangeModal.jsx
import React from 'react';

const RoleChangeModal = ({ roles, usuario, onSelectRole, onClose }) => (
  <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Cambiar Rol</h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        <div className="modal-body">
          <p>Selecciona el nuevo rol para el usuario:</p>
          <div className="d-flex flex-column gap-2">
            {roles.map(r => (
              <button
                key={r.id}
                className={`btn ${String(usuario?.rol_id) === String(r.id) ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => onSelectRole(r.id)}
              >
                {r.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default RoleChangeModal;
