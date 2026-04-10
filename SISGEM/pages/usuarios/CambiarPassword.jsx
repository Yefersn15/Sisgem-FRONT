// src/pages/usuarios/CambiarPassword.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../services/dataService';

const CambiarPassword = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    const pw = form.newPassword;
    if (pw.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await changePassword(user.id, pw);
      setSuccess('Contraseña actualizada correctamente');
      setForm({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Error al actualizar la contraseña: ' + err.message);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <div className="card">
        <div className="card-header">
          <h4 className="mb-0"><i className="fas fa-key me-2"></i>Cambiar Contraseña</h4>
        </div>
        <div className="card-body">
          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nueva Contraseña *</label>
              <input
                type="password"
                name="newPassword"
                className="form-control"
                value={form.newPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
              <div className="form-text">
                Mínimo 6 caracteres.
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Confirmar Nueva Contraseña *</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-save me-1"></i>Cambiar Contraseña
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CambiarPassword;