// src/pages/usuarios/UsuarioEdit.jsx
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUsuarioForm, TOTAL_PASOS } from './hooks/useUsuarioForm';
import LoadingState from '../../components/LoadingState';
import InformacionPersonalForm from './components/InformacionPersonalForm';
import InformacionContactoForm from './components/InformacionContactoForm';
import CredencialesForm from './components/CredencialesForm';

const PASOS = [
  { numero: 1, label: 'Información Personal' },
  { numero: 2, label: 'Contacto' },
  { numero: 3, label: 'Credenciales' },
];

const UsuarioEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser && currentUser.rol === 'ADMIN';

  const {
    isEditing,
    roles,
    loading,
    loadingData,
    loadError,
    error,
    documentoExists,
    form,
    setForm,
    fotoUrlRef,
    paso,
    mostrarErrores,
    handleChange,
    siguientePaso,
    pasoAnterior,
    handleSubmit,
  } = useUsuarioForm(id);

  if (loadingData) {
    return <div className="container mt-4"><LoadingState /></div>;
  }

  if (loadError) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h5>Error al cargar datos</h5>
          <p className="mb-0">{loadError}</p>
          <button className="btn btn-secondary mt-2" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 720 }}>
      <div className="card">
        <div className="card-header">
          <h4 className="mb-0">{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</h4>
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
                documentoRequired={!isEditing}
                documentoDisabled={isEditing}
                documentoExists={documentoExists}
                fotoUrlRef={fotoUrlRef}
                mostrarErrores={mostrarErrores}
              />
            )}
            {paso === 2 && (
              <InformacionContactoForm form={form} onChange={handleChange} />
            )}
            {paso === 3 && (
              <CredencialesForm
                form={form}
                setForm={setForm}
                onChange={handleChange}
                title="Credenciales y Acceso"
                passwordRequired={!isEditing}
                roles={roles}
                isEditing={isEditing}
                rolDisabled={!isAdmin && isEditing}
                mostrarErrores={mostrarErrores}
              />
            )}

            <div className="d-flex justify-content-between mt-4">
              <div>
                {paso > 1 && (
                  <button type="button" className="btn btn-outline-secondary me-2" onClick={pasoAnterior} disabled={loading}>
                    <i className="fas fa-arrow-left me-2"></i>Atrás
                  </button>
                )}
                <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/admin/usuarios')} disabled={loading}>
                  Cancelar
                </button>
              </div>

              {paso < TOTAL_PASOS ? (
                <button type="button" className="btn btn-primary" onClick={siguientePaso}>
                  Siguiente<i className="fas fa-arrow-right ms-2"></i>
                </button>
              ) : (
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar Cambios' : 'Crear Usuario')}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UsuarioEdit;
