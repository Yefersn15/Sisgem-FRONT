// src/pages/usuarios/Perfil.jsx
import { usePerfilForm } from './hooks/usePerfilForm';
import LoadingState from '../../shared/components/common/LoadingState';

const getInitials = (nombre, apellido) => {
  const n = (nombre || '').trim().charAt(0);
  const a = (apellido || '').trim().charAt(0);
  return (n + a).toUpperCase() || '?';
};

const getRolNombre = (rol) => {
  if (!rol) return 'Sin rol';
  return typeof rol === 'string' ? rol : (rol.nombre || 'Sin rol');
};

const InfoField = ({ icon, label, name, value, onChange, disabled, type = 'text', placeholder, required }) => (
  <div className="mb-3">
    <label className="form-label d-flex align-items-center gap-2">
      <i className={`fas ${icon}`} style={{ color: 'var(--text-muted)', width: 14 }}></i>
      {label}
    </label>
    <input
      type={type}
      name={name}
      className="form-control"
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      required={required}
    />
  </div>
);

const Perfil = () => {
  const { perfil, loading, editMode, setEditMode, form, success, error, submitting, handleChange, handleSubmit, cancelEdit } = usePerfilForm();

  if (loading) {
    return <div className="container mt-4"><LoadingState /></div>;
  }

  if (!perfil) {
    return <div className="container mt-4"><p>No se encontró el perfil</p></div>;
  }

  const nombreCompleto = `${perfil.nombre || ''} ${perfil.apellido || ''}`.trim() || 'Usuario';
  const fechaRegistro = perfil.createdAt
    ? new Date(perfil.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
    : (perfil.fecha_creacion
      ? new Date(perfil.fecha_creacion).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'N/A');

  return (
    <div className="container mt-4" style={{ maxWidth: 900 }}>
      <div className="card overflow-hidden">
        {/* Banner de encabezado */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
            padding: '32px 28px',
            position: 'relative',
          }}
        >
          <div className="d-flex align-items-center gap-3 flex-wrap">
            {perfil.fotoPerfil ? (
              <img
                src={perfil.fotoPerfil}
                alt="Foto de perfil"
                className="rounded-circle"
                style={{ width: 84, height: 84, objectFit: 'cover', border: '3px solid rgba(255,255,255,0.85)' }}
              />
            ) : (
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: 84,
                  height: 84,
                  background: 'rgba(255,255,255,0.18)',
                  border: '3px solid rgba(255,255,255,0.85)',
                  color: '#fff',
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                {getInitials(perfil.nombre, perfil.apellido)}
              </div>
            )}

            <div className="flex-grow-1">
              <h4 className="mb-1" style={{ color: '#fff' }}>{nombreCompleto}</h4>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span
                  className="badge"
                  style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
                >
                  <i className="fas fa-user-shield me-1"></i>{getRolNombre(perfil.rol)}
                </span>
                <span
                  className="badge"
                  style={{ background: perfil.estado ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)', color: '#fff' }}
                >
                  <i className={`fas ${perfil.estado ? 'fa-circle-check' : 'fa-circle-xmark'} me-1`}></i>
                  {perfil.estado ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            {!editMode && (
              <button
                className="btn"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)' }}
                onClick={() => setEditMode(true)}
              >
                <i className="fas fa-pen me-1"></i>Editar Perfil
              </button>
            )}
          </div>
        </div>

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

                <InfoField icon="fa-hashtag" label="Número de Documento" value={form.documento} disabled />
                <InfoField icon="fa-user" label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} disabled={!editMode} required />
                <InfoField icon="fa-user" label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} disabled={!editMode} />
                <InfoField icon="fa-phone" label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} disabled={!editMode} placeholder="Número de teléfono" />
                <InfoField icon="fa-envelope" label="Correo Electrónico" name="email" type="email" value={form.email} onChange={handleChange} disabled={!editMode} />
              </div>

              <div className="col-md-6">
                <h6 className="text-primary mb-3 border-bottom pb-2">
                  <i className="fas fa-shield-halved me-2"></i>Información de la Cuenta
                </h6>

                <div className="mb-3">
                  <label className="form-label d-flex align-items-center gap-2">
                    <i className="fas fa-user-shield" style={{ color: 'var(--text-muted)', width: 14 }}></i>Rol
                  </label>
                  <div
                    className="d-flex align-items-center"
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '9px 12px', minHeight: 40 }}
                  >
                    {getRolNombre(perfil.rol)}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label d-flex align-items-center gap-2">
                    <i className="fas fa-toggle-on" style={{ color: 'var(--text-muted)', width: 14 }}></i>Estado
                  </label>
                  <div
                    className="d-flex align-items-center gap-2"
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '9px 12px', minHeight: 40 }}
                  >
                    <span className={`badge ${perfil.estado ? 'badge-success' : 'badge-danger'}`}>
                      {perfil.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label d-flex align-items-center gap-2">
                    <i className="fas fa-calendar" style={{ color: 'var(--text-muted)', width: 14 }}></i>Fecha de Registro
                  </label>
                  <div
                    className="d-flex align-items-center"
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '9px 12px', minHeight: 40 }}
                  >
                    {fechaRegistro}
                  </div>
                </div>
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
