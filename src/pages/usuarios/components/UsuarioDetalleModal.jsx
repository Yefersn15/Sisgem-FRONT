// src/pages/usuarios/components/UsuarioDetalleModal.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const UsuarioDetalleModal = ({ usuario, getRoleName, onClose }) => (
  <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Detalles del Usuario</h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        <div className="modal-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label small text-muted">Documento</label>
              <p className="mb-0 fw-bold">{usuario.documento || '—'}</p>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label small text-muted">Nombre</label>
              <p className="mb-0">{usuario.nombre} {usuario.apellido}</p>
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
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <Link to={`/admin/usuarios/editar/${usuario.id}`} className="btn btn-primary">
            Editar
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default UsuarioDetalleModal;
