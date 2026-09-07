// src/pages/usuarios/hooks/useCambiarPasswordForm.js
import { useState } from 'react';
import { changePassword } from '../services/usuariosService';
import { passwordEsValida } from '../../../validations/password';

export const useCambiarPasswordForm = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.currentPassword) {
      setError('Debe ingresar la contraseña actual');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    const pw = form.newPassword;
    if (!passwordEsValida(pw)) {
      setError('La contraseña debe tener mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo');
      return;
    }

    if (form.currentPassword === pw) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(form.currentPassword, pw);
      setSuccess('Contraseña actualizada correctamente');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Error al actualizar la contraseña: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return { form, success, error, submitting, handleChange, handleSubmit };
};
