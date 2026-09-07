// src/pages/auth/Register.jsx
import { Link } from 'react-router-dom';
import { useRegisterForm, TOTAL_PASOS } from './hooks/useRegisterForm';
import InformacionPersonalForm from '../usuarios/components/InformacionPersonalForm';
import InformacionContactoForm from '../usuarios/components/InformacionContactoForm';
import CredencialesForm from '../usuarios/components/CredencialesForm';

const PASOS = [
  { numero: 1, label: 'Datos personales' },
  { numero: 2, label: 'Contacto' },
  { numero: 3, label: 'Credenciales' },
];

// Antes mostraba los 3 bloques del formulario a la vez en columnas: en
// pantallas angostas se apilaban y generaba un scroll largo. Ahora es un
// wizard de 3 pasos cortos (cada uno valida antes de avanzar, ver
// useRegisterForm) reusando los mismos bloques de campos que Perfil/UsuarioEdit.
const Register = () => {
  const { form, paso, error, loading, handleChange, siguientePaso, pasoAnterior, handleSubmit } = useRegisterForm();

  return (
    <div className="container mt-4 register-container" style={{ maxWidth: 480 }}>
      <div className="card register-card">
        <div className="card-header">
          <h4 className="mb-0">Crear Cuenta</h4>
        </div>
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between mb-4">
            {PASOS.map(({ numero, label }, i) => (
              <div key={numero} className="d-flex align-items-center flex-grow-1">
                <div className="d-flex flex-column align-items-center text-center" style={{ minWidth: 70 }}>
                  <span
                    className={`d-flex align-items-center justify-content-center rounded-circle fw-bold ${paso >= numero ? 'tema-acento-bg' : 'bg-secondary-subtle text-muted'}`}
                    style={{ width: 32, height: 32 }}
                  >
                    {paso > numero ? <i className="fas fa-check"></i> : numero}
                  </span>
                  <small className={paso === numero ? 'fw-semibold' : 'text-muted'}>{label}</small>
                </div>
                {i < PASOS.length - 1 && (
                  <div className={`flex-grow-1 ${paso > numero ? 'tema-acento-bg' : 'bg-secondary-subtle'}`} style={{ height: 2, marginBottom: 18 }} />
                )}
              </div>
            ))}
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            {paso === 1 && (
              <InformacionPersonalForm
                form={form}
                onChange={handleChange}
                telefonoField="celular"
                telefonoLabel="Celular"
              />
            )}
            {paso === 2 && (
              <InformacionContactoForm form={form} onChange={handleChange} />
            )}
            {paso === 3 && (
              <CredencialesForm form={form} onChange={handleChange} />
            )}

            <div className="d-flex justify-content-between mt-4">
              {paso > 1 ? (
                <button type="button" className="btn btn-outline-secondary" onClick={pasoAnterior} disabled={loading}>
                  <i className="fas fa-arrow-left me-2"></i>Atrás
                </button>
              ) : <span />}

              {paso < TOTAL_PASOS ? (
                <button type="button" className="btn btn-primary" onClick={siguientePaso}>
                  Siguiente<i className="fas fa-arrow-right ms-2"></i>
                </button>
              ) : (
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Registrando...' : 'Registrarse'}
                </button>
              )}
            </div>
          </form>

          <div className="text-center mt-3">
            ¿Ya tienes cuenta? <Link to="/login">Iniciar Sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
