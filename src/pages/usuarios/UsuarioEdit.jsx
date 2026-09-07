// src/pages/usuarios/UsuarioEdit.jsx
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUsuarioForm } from './hooks/useUsuarioForm';
import LoadingState from '../../components/LoadingState';
import InformacionPersonalForm from './components/InformacionPersonalForm';
import InformacionContactoForm from './components/InformacionContactoForm';
import CredencialesForm from './components/CredencialesForm';

const UsuarioEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser && (currentUser.rol_id === 5 || currentUser.rol === 'ADMIN');

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
    handleChange,
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
    <div className="container mt-4" style={{ maxWidth: 900 }}>
      <div className="card">
        <div className="card-header">
          <h4 className="mb-0">{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</h4>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-4">
                <InformacionPersonalForm
                  form={form}
                  onChange={handleChange}
                  documentoRequired={!isEditing}
                  documentoDisabled={isEditing}
                  documentoExists={documentoExists}
                />
              </div>

              <div className="col-md-4">
                <InformacionContactoForm form={form} onChange={handleChange} />
              </div>

              <div className="col-md-4">
                <CredencialesForm
                  form={form}
                  setForm={setForm}
                  onChange={handleChange}
                  title="Credenciales y Acceso"
                  passwordRequired={!isEditing}
                  roles={roles}
                  isEditing={isEditing}
                  rolDisabled={!isAdmin && isEditing}
                />
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-12">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar Cambios' : 'Crear Usuario')}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={() => navigate('/admin/usuarios')}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UsuarioEdit;
