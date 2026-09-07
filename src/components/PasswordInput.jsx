import { useState } from 'react';

// Campo de contraseña con botón para mostrar/ocultar el texto. `tabIndex={-1}`
// en el botón: no debe interrumpir la tabulación entre campos del formulario.
const PasswordInput = ({ className = '', invalid, ...rest }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="input-group">
      <input type={visible ? 'text' : 'password'} className={`form-control ${invalid ? 'is-invalid' : ''} ${className}`} {...rest} />
      <button
        type="button"
        className="btn btn-outline-secondary"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        <i className={`fas ${visible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
      </button>
    </div>
  );
};

export default PasswordInput;
