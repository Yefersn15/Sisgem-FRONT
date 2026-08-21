// src/context/ToastContext.jsx
// Notificaciones no bloqueantes para reemplazar los alert() nativos del
// navegador, usando las clases .toast ya definidas (y sin usar) en App.css.
import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

const ICONS = {
  success: 'fa-check-circle',
  danger: 'fa-exclamation-circle',
  warning: 'fa-triangle-exclamation',
  info: 'fa-circle-info',
};

const TITLES = {
  success: 'Listo',
  danger: 'Error',
  warning: 'Atención',
  info: 'Información',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, type = 'info', duration = 4500) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  const toast = {
    show,
    success: (msg, duration) => show(msg, 'success', duration),
    error: (msg, duration) => show(msg, 'danger', duration),
    warning: (msg, duration) => show(msg, 'warning', duration),
    info: (msg, duration) => show(msg, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="d-flex flex-column gap-2"
        style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 2000, maxWidth: 360 }}
      >
        {toasts.map((t) => (
          <div key={t.id} className="toast show" role="alert" style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
            <div className="toast-header">
              <i className={`fas ${ICONS[t.type]} me-2`} style={{ color: `var(--${t.type === 'danger' ? 'danger' : t.type})` }}></i>
              <strong className="me-auto">{TITLES[t.type]}</strong>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => dismiss(t.id)}></button>
            </div>
            <div className="toast-body">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
};
