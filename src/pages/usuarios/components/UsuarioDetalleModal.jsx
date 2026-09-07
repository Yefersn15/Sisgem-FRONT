// src/pages/usuarios/components/UsuarioDetalleModal.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Modal from '../../../components/Modal';

const UsuarioDetalleModal = ({ usuario, getRoleName, onClose }) => (
  <Modal
    title="Detalles del Usuario"
    onClose={onClose}
    maxWidth={620}
    footer={
      <>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cerrar
        </button>
        <Link to={`/admin/usuarios/editar/${usuario.id}`} className="btn btn-primary">
          Editar
        </Link>
      </>
    }
  >
    <div className="row">
      <div className="col-12 mb-3 d-flex align-items-center gap-3">
        {usuario.fotoUrl ? (
          <img
            src={usuario.fotoUrl}
            alt=""
            className="rounded-circle"
            style={{ width: 64, height: 64, objectFit: 'cover' }}
          />
        ) : (
          <div
            className="rounded-circle bg-secondary-subtle d-flex align-items-center justify-content-center"
            style={{ width: 64, height: 64 }}
          >
            <i className="fas fa-user text-muted fa-lg"></i>
          </div>
        )}
        <div>
          <p className="mb-0 fw-bold fs-5">{usuario.nombre} {usuario.apellido}</p>
          <p className="mb-0 text-muted small">{usuario.documento || '—'}</p>
        </div>
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label small text-muted">Email</label>
        <p className="mb-0">{usuario.email || '—'}</p>
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label small text-muted">Teléfono</label>
        <p className="mb-0">{usuario.telefono || '—'}</p>
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label small text-muted">Rol</label>
        <p className="mb-0">{getRoleName(usuario.rol_id, usuario.rol_nombre) || 'Sin rol'}</p>
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label small text-muted">Estado</label>
        <p className="mb-0">
          <span className={`badge ${usuario.estado ? 'bg-success' : 'bg-secondary'}`}>
            {usuario.estado ? 'Activo' : 'Inactivo'}
          </span>
        </p>
      </div>
      {usuario.direccion && (
        <div className="col-12 mb-3">
          <label className="form-label small text-muted">Dirección</label>
          <p className="mb-0">{usuario.direccion}</p>
        </div>
      )}
      {usuario.barrio && (
        <div className="col-12 mb-3">
          <label className="form-label small text-muted">Barrio</label>
          <p className="mb-0">{usuario.barrio}</p>
        </div>
      )}
      <div className="col-12 mb-3">
        <label className="form-label small text-muted">Fecha de Creación</label>
        <p className="mb-0">{usuario.fecha_creacion ? new Date(usuario.fecha_creacion).toLocaleString() : '—'}</p>
      </div>
    </div>
  </Modal>
);

export default UsuarioDetalleModal;
