// src/pages/auth/ForgotPassword.jsx
import { Link } from 'react-router-dom';
import { useForgotPasswordForm } from './hooks/useForgotPasswordForm';

const ForgotPassword = () => {
  const { email, setEmail, enviado, error, handleSubmit } = useForgotPasswordForm();

  if (enviado) {
    return (
      <div className="container mt-5 login-container" style={{ maxWidth: 400 }}>
        <div className="card login-card">
          <div className="card-header">Recuperar Contraseña</div>
          <div className="card-body text-center">
            <div className="text-success mb-3">
              <i className="fas fa-check-circle fa-3x"></i>
            </div>
            <p>Se ha enviado un enlace de recuperación a <strong>{email}</strong></p>
            <p className="text-muted small">En una aplicación real, recibirías un email con instrucciones.</p>
            <Link to="/login" className="btn btn-primary">Volver a Iniciar Sesión</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 login-container" style={{ maxWidth: 400 }}>
      <div className="card login-card">
        <div className="card-header">Recuperar Contraseña</div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <p className="text-muted">Ingresa tu email y te enviaremos un enlace para recuperar tu contraseña.</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-100">Enviar Enlace</button>
          </form>
          <div className="mt-3 text-center">
            <Link to="/login">Volver a Iniciar Sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
