import { useCambiarPasswordForm } from './hooks/useCambiarPasswordForm';
import PasswordInput from '../../components/PasswordInput';
import PasswordRequisitos from '../../components/PasswordRequisitos';

const CambiarPassword = () => {
  const { form, success, error, submitting, handleChange, handleSubmit } = useCambiarPasswordForm();
  const noCoinciden = form.confirmPassword.length > 0 && form.newPassword !== form.confirmPassword;

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
            <div className="mb-3">
              <label className="form-label">Contraseña Actual *</label>
              <PasswordInput
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>

            <hr style={{ borderColor: 'var(--border)', margin: '20px 0' }} />

            <div className="mb-3">
              <label className="form-label">Nueva Contraseña *</label>
              <PasswordInput
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              {form.newPassword.length > 0 ? (
                <PasswordRequisitos password={form.newPassword} />
              ) : (
                <div className="form-text">Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo.</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Confirmar Nueva Contraseña *</label>
              <PasswordInput
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
                invalid={noCoinciden}
              />
              {noCoinciden && <div className="invalid-feedback d-block">Las contraseñas no coinciden</div>}
            </div>

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
