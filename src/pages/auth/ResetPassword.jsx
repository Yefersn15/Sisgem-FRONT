// src/pages/auth/ResetPassword.jsx
import { Link } from 'react-router-dom';
import { useResetPasswordForm } from './hooks/useResetPasswordForm';

const ResetPassword = () => {
  const { email, password, setPassword, confirmPassword, setConfirmPassword, error, success, handleSubmit } = useResetPasswordForm();

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

  if (error && !email) {
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
          <p className="text-muted">Ingresa tu nueva contraseña para <strong>{email}</strong></p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nueva Contraseña</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div className="mb-3">
              <label className="form-label">Confirmar Contraseña</label>
              <input type="password" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={!!error}>Cambiar Contraseña</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
