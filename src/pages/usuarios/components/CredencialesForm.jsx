import { emailEsValido, MENSAJE_EMAIL_INVALIDO } from '../../../validations/email';
import { passwordEsValida } from '../../../validations/password';
import PasswordInput from '../../../components/PasswordInput';
import PasswordRequisitos from '../../../components/PasswordRequisitos';

const CredencialesForm = ({
  form,
  setForm,
  onChange,
  title = 'Credenciales',
  passwordRequired = true,
  passwordHint = 'Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo',
  roles,
  isEditing = false,
  rolDisabled = false,
}) => {
  const emailInvalido = form.email.length > 0 && !emailEsValido(form.email);
  const escribiendoPassword = form.password.length > 0;
  const passwordInvalida = escribiendoPassword && !passwordEsValida(form.password);
  const noCoinciden = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  return (
    <div>
      <h6 className="text-primary mb-3 border-bottom pb-2">{title}</h6>

      <div className="mb-3">
        <label className="form-label">Email *</label>
        <input
          type="email"
          name="email"
          className={`form-control ${emailInvalido ? 'is-invalid' : ''}`}
          value={form.email}
          onChange={onChange}
          required
        />
        {emailInvalido && <div className="invalid-feedback">{MENSAJE_EMAIL_INVALIDO}</div>}
      </div>
      <div className="mb-3">
        <label className="form-label">
          Contraseña {passwordRequired ? '*' : '(dejar vacío para mantener)'}
        </label>
        <PasswordInput
          name="password"
          value={form.password}
          onChange={onChange}
          required={passwordRequired}
          invalid={passwordInvalida}
        />
        {escribiendoPassword ? (
          <PasswordRequisitos password={form.password} />
        ) : (
          <small className="text-muted">{passwordHint}</small>
        )}
      </div>
      <div className="mb-3">
        <label className="form-label">Confirmar Contraseña {passwordRequired ? '*' : ''}</label>
        <PasswordInput
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={onChange}
          required={passwordRequired || !!form.password}
          invalid={noCoinciden}
        />
        {noCoinciden && <div className="invalid-feedback d-block">Las contraseñas no coinciden</div>}
      </div>

      {roles && (
        <div className="mb-3">
          <label className="form-label">Rol *</label>
          <select
            name="rolId"
            className="form-select"
            value={form.rolId}
            onChange={onChange}
            required
            disabled={rolDisabled}
          >
            <option value="">Seleccionar rol...</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </select>
        </div>
      )}

      {isEditing && setForm && (
        <div className="mb-3">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="estado"
              checked={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="estado">
              Usuario Activo
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default CredencialesForm;
