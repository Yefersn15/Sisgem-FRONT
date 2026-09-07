// src/pages/usuarios/Perfil.jsx
import { usePerfilForm } from './hooks/usePerfilForm';
import LoadingState from '../../components/LoadingState';
import PerfilHeader from './components/PerfilHeader';
import InfoField from './components/InfoField';
import InformacionCuentaView from './components/InformacionCuentaView';
import ImageUploadField from '../../components/upload/ImageUploadField';

const Perfil = () => {
  const { perfil, loading, editMode, setEditMode, form, fotoUrlRef, success, error, submitting, handleChange, handleSubmit, cancelEdit } = usePerfilForm();

  if (loading) {
    return <div className="container mt-4"><LoadingState /></div>;
  }

  if (!perfil) {
    return <div className="container mt-4"><p>No se encontró el perfil</p></div>;
  }

  const fechaRegistro = perfil.createdAt
    ? new Date(perfil.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
    : (perfil.fecha_creacion
      ? new Date(perfil.fecha_creacion).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'N/A');

  return (
    <div className="container mt-4" style={{ maxWidth: 900 }}>
      <div className="card overflow-hidden">
        <PerfilHeader perfil={perfil} editMode={editMode} onEdit={() => setEditMode(true)} />

        <div className="card-body" style={{ padding: '28px' }}>
          {success && (
            <div className="alert alert-success">
              <i className="fas fa-check-circle me-2"></i>{success}
            </div>
          )}
          {error && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-circle me-2"></i>{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <h6 className="text-primary mb-3 border-bottom pb-2">
                  <i className="fas fa-id-card me-2"></i>Información Personal
                </h6>

                {editMode && (
                  <div className="mb-3">
                    <ImageUploadField
                      ref={fotoUrlRef}
                      label="Foto de perfil"
                      name="fotoUrl"
                      value={form.fotoUrl}
                      onChange={handleChange}
                      folder="usuarios"
                      size={72}
                    />
                  </div>
                )}

                <InfoField icon="fa-hashtag" label="Número de Documento" value={form.documento} disabled />
                <InfoField icon="fa-user" label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} disabled={!editMode} required />
                <InfoField icon="fa-user" label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} disabled={!editMode} />
                <InfoField icon="fa-phone" label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} disabled={!editMode} placeholder="Número de teléfono" />
                <InfoField icon="fa-envelope" label="Correo Electrónico" name="email" type="email" value={form.email} onChange={handleChange} disabled={!editMode} />
              </div>

              <div className="col-md-6">
                <InformacionCuentaView perfil={perfil} fechaRegistro={fechaRegistro} />
              </div>
            </div>

            {editMode && (
              <div className="row mt-2">
                <div className="col-12 d-flex gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Guardando...</>
                    ) : (
                      <><i className="fas fa-save me-1"></i>Guardar Cambios</>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cancelEdit}
                    disabled={submitting}
                  >
                    <i className="fas fa-times me-1"></i>Cancelar
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
