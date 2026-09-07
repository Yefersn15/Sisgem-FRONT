import { getRolNombre } from '../hooks/rolUtils';

const ReadOnlyRow = ({ icon, label, children }) => (
  <div className="mb-3">
    <label className="form-label d-flex align-items-center gap-2">
      <i className={`fas ${icon}`} style={{ color: 'var(--text-muted)', width: 14 }}></i>{label}
    </label>
    <div
      className="d-flex align-items-center gap-2"
      style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '9px 12px', minHeight: 40 }}
    >
      {children}
    </div>
  </div>
);

const InformacionCuentaView = ({ perfil, fechaRegistro }) => (
  <div>
    <h6 className="text-primary mb-3 border-bottom pb-2">
      <i className="fas fa-shield-halved me-2"></i>Información de la Cuenta
    </h6>

    <ReadOnlyRow icon="fa-user-shield" label="Rol">{getRolNombre(perfil.rol)}</ReadOnlyRow>

    <ReadOnlyRow icon="fa-toggle-on" label="Estado">
      <span className={`badge ${perfil.estado ? 'badge-success' : 'badge-danger'}`}>
        {perfil.estado ? 'Activo' : 'Inactivo'}
      </span>
    </ReadOnlyRow>

    <ReadOnlyRow icon="fa-calendar" label="Fecha de Registro">{fechaRegistro}</ReadOnlyRow>
  </div>
);

export default InformacionCuentaView;
