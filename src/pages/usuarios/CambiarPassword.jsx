import { useState } from 'react';
import { useCambiarPasswordForm } from './hooks/useCambiarPasswordForm';

const PasswordField = ({ label, name, value, onChange, autoComplete, minLength, helpText }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div className="input-group">
        <input
          type={visible ? 'text' : 'password'}
          name={name}
          className="form-control"
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
          minLength={minLength}
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          <i className={`fas ${visible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
        </button>
      </div>
      {helpText && <div className="form-text">{helpText}</div>}
    </div>
  );
};

const CambiarPassword = () => {
  const { form, success, error, submitting, handleChange, handleSubmit } = useCambiarPasswordForm();

  return (
    <div className="container mt-4" style={{ maxWidth: 520 }}>
      <div className="card">
        <div
          className="card-header d-flex align-items-center gap-3"
          style={{ padding: '20px' }}
        >
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--accent-dim)',
              color: 'var(--accent)',
              flexShrink: 0,
            }}
          >
            <i className="fas fa-key"></i>
          </div>
          <div>
            <h4 className="mb-0">Cambiar Contraseña</h4>
            <small className="text-muted">Protege tu cuenta actualizando tu contraseña</small>
          </div>
        </div>
        <div className="card-body">
          {success && (
            <div className="alert alert-success">
              <i className="fas fa-check-circle me-2"></i>{success}
            </div>
          )}
          {error && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-circle me-2"></i>{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <PasswordField
              label="Contraseña Actual *"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              autoComplete="current-password"
            />

            <hr style={{ borderColor: 'var(--border)', margin: '20px 0' }} />

            <PasswordField
              label="Nueva Contraseña *"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={6}
              helpText="Mínimo 6 caracteres."
            />

            <PasswordField
              label="Confirmar Nueva Contraseña *"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />

            <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Guardando...</>
                ) : (
                  <><i className="fas fa-save me-1"></i>Cambiar Contraseña</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CambiarPassword;
