// src/pages/auth/hooks/useResetPasswordForm.js
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { usePasswordFields } from '../../../hooks/usePasswordFields';

export const useResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const { password, setPassword, confirmPassword, setConfirmPassword, noCoinciden, validar } = usePasswordFields();
  const [error, setError] = useState(token ? '' : 'Enlace de recuperación inválido. Solicita uno nuevo.');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError('Enlace de recuperación inválido. Solicita uno nuevo.');
      return;
    }

    const mensajeValidacion = validar({ obligatoria: true });
    if (mensajeValidacion) {
      setError(mensajeValidacion);
      return;
    }

    setError('');
    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'No se pudo restablecer la contraseña. El enlace puede haber expirado.');
    } finally {
      setLoading(false);
    }
  };

  return { token, password, setPassword, confirmPassword, setConfirmPassword, noCoinciden, error, loading, success, handleSubmit };
};
