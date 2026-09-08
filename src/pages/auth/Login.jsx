import { Link, useLocation } from 'react-router-dom';
import { useLoginForm } from './hooks/useLoginForm';
import { useAyudaPagina } from '../../hooks/useAyudaPagina';

const Login = () => {
  const location = useLocation();
  const sessionExpired = location.state?.sessionExpired;
  useAyudaPagina({
    titulo: 'Iniciar sesión',
    contenido: (
      <>
        <p>Ingresa con el email y la contraseña con los que te registraste. Si aún no tienes cuenta, usa el enlace "¿No tienes cuenta? Regístrate" debajo del formulario.</p>
        <p>¿Olvidaste tu contraseña? Usa "¿Olvidaste tu contraseña?": te enviaremos un enlace de un solo uso por correo, válido durante 1 hora, para elegir una nueva.</p>
      </>
    ),
  });
  const { email, setEmail, password, setPassword, error, loading, handleSubmit } = useLoginForm();

  return (
    <div className="container mt-5 login-container" style={{ maxWidth: 400 }}>
      <div className="card login-card">
        <div className="card-header">Iniciar Sesión</div>
        <div className="card-body">
          {sessionExpired && !error && (
            <div className="alert alert-warning">Tu sesión expiró. Inicia sesión de nuevo para continuar.</div>
          )}
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
          <div className="mt-3 text-center">
            <Link to="/register">¿No tienes cuenta? Regístrate</Link><br />
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
