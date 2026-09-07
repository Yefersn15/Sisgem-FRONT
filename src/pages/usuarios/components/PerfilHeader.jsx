import { getRolNombre } from '../hooks/rolUtils';

const getInitials = (nombre, apellido) => {
  const n = (nombre || '').trim().charAt(0);
  const a = (apellido || '').trim().charAt(0);
  return (n + a).toUpperCase() || '?';
};

const PerfilHeader = ({ perfil, editMode, onEdit }) => {
  const nombreCompleto = `${perfil.nombre || ''} ${perfil.apellido || ''}`.trim() || 'Usuario';

  return (
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
            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
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
            onClick={onEdit}
          >
            <i className="fas fa-pen me-1"></i>Editar Perfil
          </button>
        )}
      </div>
    </div>
  );
};

export default PerfilHeader;
