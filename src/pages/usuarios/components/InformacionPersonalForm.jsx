import { documentoEsValido, mensajeDocumentoInvalido } from '../../../validations/documento';
import { telefonoEsValido, MENSAJE_TELEFONO_INVALIDO } from '../../../validations/telefono';

const InformacionPersonalForm = ({
  form,
  onChange,
  telefonoField = 'telefono',
  telefonoLabel = 'Teléfono',
  documentoRequired = true,
  documentoDisabled = false,
  documentoExists = false,
}) => {
  const documentoInvalido = form.documento.length > 0 && !documentoEsValido(form.documento, form.tipoDocumento);
  const telefonoValue = form[telefonoField] || '';
  const telefonoInvalido = telefonoValue.length > 0 && !telefonoEsValido(telefonoValue);

  return (
    <div>
      <h6 className="text-primary mb-3 border-bottom pb-2">Información Personal</h6>

      <div className="mb-3">
        <label className="form-label">Nombre *</label>
        <input type="text" name="nombre" className="form-control" value={form.nombre} onChange={onChange} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Apellido *</label>
        <input type="text" name="apellido" className="form-control" value={form.apellido} onChange={onChange} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Tipo Documento</label>
        <select name="tipoDocumento" className="form-select" value={form.tipoDocumento} onChange={onChange}>
          <option value="CC">CC - Cédula de Ciudadanía</option>
          <option value="CE">CE - Cédula de Extranjería</option>
          <option value="NIT">NIT</option>
          <option value="PAS">Pasaporte</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Número de Documento {documentoRequired && '*'}</label>
        <input
          type="text"
          name="documento"
          className={`form-control ${(documentoExists || documentoInvalido) ? 'is-invalid' : ''}`}
          value={form.documento}
          onChange={onChange}
          required={documentoRequired}
          disabled={documentoDisabled}
        />
        {documentoExists && <div className="invalid-feedback">El documento ya existe</div>}
        {!documentoExists && documentoInvalido && (
          <div className="invalid-feedback">{mensajeDocumentoInvalido(form.tipoDocumento)}</div>
        )}
      </div>
      <div className="mb-3">
        <label className="form-label">Género</label>
        <select name="genero" className="form-select" value={form.genero} onChange={onChange}>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
          <option value="Otro">Otro</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">{telefonoLabel}</label>
        <input
          type="tel"
          name={telefonoField}
          className={`form-control ${telefonoInvalido ? 'is-invalid' : ''}`}
          value={telefonoValue}
          onChange={onChange}
        />
        {telefonoInvalido && <div className="invalid-feedback">{MENSAJE_TELEFONO_INVALIDO}</div>}
      </div>
    </div>
  );
};

export default InformacionPersonalForm;
