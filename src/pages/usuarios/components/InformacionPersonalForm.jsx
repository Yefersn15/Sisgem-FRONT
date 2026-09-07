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
  // true tras un intento de avanzar/enviar con campos requeridos vacíos (ver
  // useRegisterForm): antes de eso, un campo vacío no se marca como
  // inválido, solo uno con contenido inválido (documento/teléfono mal
  // escritos), igual que en Perfil/UsuarioEdit donde este prop no se pasa.
  mostrarErrores = false,
}) => {
  const nombreVacio = mostrarErrores && !form.nombre.trim();
  const apellidoVacio = mostrarErrores && !form.apellido.trim();
  const documentoVacio = mostrarErrores && documentoRequired && !form.documento.trim();
  const documentoFormatoInvalido = form.documento.length > 0 && !documentoEsValido(form.documento, form.tipoDocumento);
  const documentoInvalido = documentoVacio || documentoFormatoInvalido;
  const telefonoValue = form[telefonoField] || '';
  const telefonoInvalido = telefonoValue.length > 0 && !telefonoEsValido(telefonoValue);

  return (
    <div>
      <h6 className="text-primary mb-3 border-bottom pb-2">Información Personal</h6>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Nombre *</label>
          <input
            type="text"
            name="nombre"
            className={`form-control ${nombreVacio ? 'is-invalid' : ''}`}
            value={form.nombre}
            onChange={onChange}
            required
          />
          {nombreVacio && <div className="invalid-feedback">Completa el nombre</div>}
        </div>
        <div className="col-md-6">
          <label className="form-label">Apellido *</label>
          <input
            type="text"
            name="apellido"
            className={`form-control ${apellidoVacio ? 'is-invalid' : ''}`}
            value={form.apellido}
            onChange={onChange}
            required
          />
          {apellidoVacio && <div className="invalid-feedback">Completa el apellido</div>}
        </div>
        <div className="col-md-6">
          <label className="form-label">Tipo Documento</label>
          <select name="tipoDocumento" className="form-select" value={form.tipoDocumento} onChange={onChange}>
            <option value="CC">CC - Cédula de Ciudadanía</option>
            <option value="CE">CE - Cédula de Extranjería</option>
            <option value="NIT">NIT</option>
            <option value="PAS">Pasaporte</option>
          </select>
        </div>
        <div className="col-md-6">
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
          {!documentoExists && documentoVacio && <div className="invalid-feedback">Ingresa el número de documento</div>}
          {!documentoExists && !documentoVacio && documentoFormatoInvalido && (
            <div className="invalid-feedback">{mensajeDocumentoInvalido(form.tipoDocumento)}</div>
          )}
        </div>
        <div className="col-md-6">
          <label className="form-label">Género</label>
          <select name="genero" className="form-select" value={form.genero} onChange={onChange}>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div className="col-md-6">
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
    </div>
  );
};

export default InformacionPersonalForm;
