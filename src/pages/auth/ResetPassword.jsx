// src/pages/auth/ResetPassword.jsx
import { Link } from 'react-router-dom';
import { useResetPasswordForm } from './hooks/useResetPasswordForm';
import PasswordInput from '../../components/PasswordInput';
import PasswordRequisitos from '../../components/PasswordRequisitos';

const ResetPassword = () => {
  const { token, password, setPassword, confirmPassword, setConfirmPassword, noCoinciden, error, loading, success, handleSubmit } = useResetPasswordForm();

  if (success) {
    return (
      <div className="container mt-5 login-container" style={{ maxWidth: 400 }}>
        <div className="card login-card">
          <div className="card-header">Restablecer Contraseña</div>
          <div className="card-body text-center">
            <div className="text-success mb-3">
              <i className="fas fa-check-circle fa-3x"></i>
            </div>
            <p>Tu contraseña ha sido restablecida exitosamente.</p>
            <p className="text-muted">Serás redirigido al login en unos segundos...</p>
            <Link to="/login" className="btn btn-primary">Ir al Login</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="container mt-5 login-container" style={{ maxWidth: 400 }}>
        <div className="card login-card">
          <div className="card-header">Error</div>
          <div className="card-body">
            <div className="alert alert-danger">{error}</div>
            <Link to="/forgot-password" className="btn btn-primary">Solicitar nuevo enlace</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 login-container" style={{ maxWidth: 400 }}>
      <div className="card login-card">
        <div className="card-header">Nueva Contraseña</div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <p className="text-muted">Ingresa tu nueva contraseña.</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nueva Contraseña</label>
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
              {password.length > 0 && <PasswordRequisitos password={password} />}
            </div>
            <div className="mb-3">
              <label className="form-label">Confirmar Contraseña</label>
              <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} invalid={noCoinciden} />
              {noCoinciden && <div className="invalid-feedback d-block">Las contraseñas no coinciden</div>}
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Guardando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
