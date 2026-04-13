// src/pages/auth/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/dataService';

const normalizeText = (text) => {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    tipoDocumento: 'CC',
    documento: '',
    genero: 'Otro',
    celular: '',
    direccion: '',
    barrio: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (['nombre', 'apellido', 'direccion', 'barrio'].includes(name)) {
      processedValue = normalizeText(value);
    } else if (name === 'documento') {
      processedValue = value.toUpperCase();
    }
    
    setForm({ ...form, [name]: processedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (form.password !== form.confirmPassword) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }

      // Validación de complejidad: mínimo 6 caracteres
      const pw = form.password || '';
      if (pw.length < 6) {
        setError('La contraseña debe tener mínimo 6 caracteres');
        setLoading(false);
        return;
      }

      // Llamar a la API para registrar
      const result = await registerUser({
        nombre: normalizeText(form.nombre),
        apellido: normalizeText(form.apellido),
        tipoDocumento: form.tipoDocumento,
        documento: form.documento.toUpperCase(),
        genero: form.genero,
        telefono: form.celular,
        direccion: form.direccion ? normalizeText(form.direccion) : '',
        barrio: form.barrio ? normalizeText(form.barrio) : '',
        email: form.email.toLowerCase().trim(),
        password: form.password
      });

      // La API retorna null en data si fue exitoso
      if (result === null) {
        alert('Registro exitoso. Por favor inicia sesión.');
        navigate('/login');
      } else if (result) {
        alert('Registro exitoso. Por favor inicia sesión.');
        navigate('/login');
      } else {
        setError('Error al registrar. Intenta nuevamente.');
      }
    } catch (err) {
      setError(err.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4 register-container" style={{ maxWidth: 900 }}>
      <div className="card register-card">
        <div className="card-header">
          <h4 className="mb-0">Crear Cuenta</h4>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Columna 1: Información Personal */}
              <div className="col-md-4">
                <h6 className="text-primary mb-3 border-bottom pb-2">Información Personal</h6>
                
                <div className="mb-3">
                  <label className="form-label">Nombre *</label>
                  <input type="text" name="nombre" className="form-control" value={form.nombre} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Apellido *</label>
                  <input type="text" name="apellido" className="form-control" value={form.apellido} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tipo Documento</label>
                  <select name="tipoDocumento" className="form-select" value={form.tipoDocumento} onChange={handleChange}>
                    <option value="CC">CC - Cédula de Ciudadanía</option>
                    <option value="CE">CE - Cédula de Extranjería</option>
                    <option value="NIT">NIT</option>
                    <option value="PAS">Pasaporte</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Número de Documento *</label>
                  <input type="text" name="documento" className="form-control" value={form.documento} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Género</label>
                  <select name="genero" className="form-select" value={form.genero} onChange={handleChange}>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Celular</label>
                  <input type="tel" name="celular" className="form-control" value={form.celular} onChange={handleChange} />
                </div>
              </div>

              {/* Columna 2: Información de Contacto */}
              <div className="col-md-4">
                <h6 className="text-primary mb-3 border-bottom pb-2">Información de Contacto</h6>
                
                <div className="mb-3">
                  <label className="form-label">Dirección</label>
                  <input type="text" name="direccion" className="form-control" value={form.direccion} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Barrio</label>
                  <input type="text" name="barrio" className="form-control" value={form.barrio} onChange={handleChange} />
                </div>
              </div>

              {/* Columna 3: Credenciales */}
              <div className="col-md-4">
                <h6 className="text-primary mb-3 border-bottom pb-2">Credenciales</h6>
                
                <div className="mb-3">
                  <label className="form-label">Email *</label>
                  <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contraseña *</label>
                  <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required />
                  <small className="text-muted">Mínimo 6 caracteres</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirmar Contraseña *</label>
                  <input type="password" name="confirmPassword" className="form-control" value={form.confirmPassword} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Registrando...' : 'Registrarse'}
                </button>
                <span className="ms-3">
                  ¿Ya tienes cuenta? <Link to="/login">Iniciar Sesión</Link>
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;