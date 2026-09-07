// src/hooks/usePasswordFields.js
import { useState } from 'react';
import { passwordEsValida } from '../validations/password';

// Estado y validación de "contraseña + confirmar contraseña", compartido por
// todo lo que establece una contraseña (registro, restablecer por enlace,
// cambiar contraseña, crear/editar usuario desde admin) para no repetir el
// mismo chequeo de coincidencia y fuerza en cada formulario.
export const usePasswordFields = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const noCoinciden = confirmPassword.length > 0 && password !== confirmPassword;

  // `obligatoria`: en registro/crear-usuario una contraseña vacía es un
  // error; en perfil/editar-usuario una contraseña vacía significa "no
  // cambiarla" y no se valida nada más.
  const validar = ({ obligatoria = false } = {}) => {
    if (!password) {
      return obligatoria ? 'Define una contraseña' : null;
    }
    if (password !== confirmPassword) return 'Las contraseñas no coinciden';
    if (!passwordEsValida(password)) return 'La contraseña debe incluir mayúscula, minúscula, número y símbolo';
    return null;
  };

  const reset = () => {
    setPassword('');
    setConfirmPassword('');
  };

  return { password, setPassword, confirmPassword, setConfirmPassword, noCoinciden, validar, reset };
};
