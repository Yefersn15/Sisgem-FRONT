// src/pages/usuarios/hooks/useCambiarPasswordForm.js
import { useState } from 'react';
import { changePassword } from '../services/usuariosService';

export const useCambiarPasswordForm = () => {
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    const pw = form.newPassword;
    if (pw.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await changePassword(pw);
      setSuccess('Contraseña actualizada correctamente');
      setForm({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Error al actualizar la contraseña: ' + err.message);
    }
  };

  return { form, success, error, handleChange, handleSubmit };
};
