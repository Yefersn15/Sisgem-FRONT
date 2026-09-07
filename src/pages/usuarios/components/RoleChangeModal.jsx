// src/pages/usuarios/components/RoleChangeModal.jsx
import React from 'react';
import Modal from '../../../components/Modal';

const RoleChangeModal = ({ roles, usuario, onSelectRole, onClose }) => (
  <Modal title="Cambiar Rol" onClose={onClose} maxWidth={420}>
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
  </Modal>
);

export default RoleChangeModal;
