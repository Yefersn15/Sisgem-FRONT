// src/pages/auth/ResetPassword.jsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { updateUsuario, getUsuarioByEmail } from '../../services/dataService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email || !token) {
      setError('Enlace inválido');
    } else {
      const storedToken = localStorage.getItem('reset_token_' + email);
      if (storedToken !== token) {
        setError('Enlace de recuperación inválido o expirado');
      }
    }
  }, [email, token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const usuario = getUsuarioByEmail(email);
      if (usuario) {
        updateUsuario(usuario.id, { password_hash: password });
        localStorage.removeItem('reset_token_' + email);
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError('Usuario no encontrado');
      }
    } catch (err) {
      setError(err.message || 'Error al actualizar contraseña');
    }
  };

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