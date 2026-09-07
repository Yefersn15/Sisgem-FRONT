// src/pages/auth/Register.jsx
import { Link } from 'react-router-dom';
import { useRegisterForm } from './hooks/useRegisterForm';
import InformacionPersonalForm from '../usuarios/components/InformacionPersonalForm';
import InformacionContactoForm from '../usuarios/components/InformacionContactoForm';
import CredencialesForm from '../usuarios/components/CredencialesForm';

const Register = () => {
  const { form, error, loading, handleChange, handleSubmit } = useRegisterForm();

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
              <div className="col-md-4">
                <InformacionPersonalForm
                  form={form}
                  onChange={handleChange}
                  telefonoField="celular"
                  telefonoLabel="Celular"
                />
              </div>

              <div className="col-md-4">
                <InformacionContactoForm form={form} onChange={handleChange} />
              </div>

              <div className="col-md-4">
                <CredencialesForm form={form} onChange={handleChange} />
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
