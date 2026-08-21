// src/shared/components/common/Modal.jsx
// Modal genérico sobre el sistema de diseño ya definido en App.css
// (.modal-overlay / .modal-content / .modal-header / .modal-footer),
// para que todos los modales de la app compartan el mismo look & feel.
import { useEffect } from 'react';

const Modal = ({ title, onClose, children, footer, maxWidth = 520 }) => {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="modal-content" style={{ maxWidth, width: '95%' }}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div>{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
