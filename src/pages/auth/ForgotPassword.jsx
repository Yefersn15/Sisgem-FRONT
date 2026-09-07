// src/pages/auth/ForgotPassword.jsx
import { Link } from 'react-router-dom';
import { useForgotPasswordForm } from './hooks/useForgotPasswordForm';
import { useAyudaPagina } from '../../hooks/useAyudaPagina';

const ForgotPassword = () => {
  useAyudaPagina({
    titulo: 'Recuperar contraseña',
    contenido: (
      <>
        <p>Ingresa el email con el que te registraste. Si esa cuenta existe, te llegará un correo con un enlace para elegir una nueva contraseña; el enlace expira en 1 hora.</p>
        <p>Por seguridad, el mensaje en pantalla es el mismo exista o no una cuenta con ese email: así nadie puede usar este formulario para averiguar qué correos están registrados.</p>
      </>
    ),
  });
  const { email, setEmail, enviado, error, loading, handleSubmit } = useForgotPasswordForm();

  if (enviado) {
    return (
      <div className="container mt-5 login-container" style={{ maxWidth: 400 }}>
        <div className="card login-card">
          <div className="card-header">Recuperar Contraseña</div>
          <div className="card-body text-center">
            <div className="text-success mb-3">
              <i className="fas fa-check-circle fa-3x"></i>
            </div>
            <p>Si <strong>{email}</strong> está registrado en nuestro sistema, recibirás un correo con instrucciones para restablecer tu contraseña.</p>
            <p className="text-muted small">Revisa también tu carpeta de spam. El enlace expira en 1 hora.</p>
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
          <p className="text-muted">Ingresa tu email y, si la cuenta existe, te enviaremos un enlace para recuperar tu contraseña.</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Enlace'}
            </button>
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
