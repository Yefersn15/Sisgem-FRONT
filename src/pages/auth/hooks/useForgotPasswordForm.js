// src/pages/auth/hooks/useForgotPasswordForm.js
import { useState } from 'react';
import { forgotPassword } from '../services/authService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Ingresa tu email');
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Ingresa un email válido');
      return;
    }

    setLoading(true);
    try {
      // El backend siempre responde con el mismo mensaje genérico exista o no
      // la cuenta, para no permitir averiguar qué correos están registrados.
      await forgotPassword(email.trim());
      setEnviado(true);
    } catch (err) {
      setError(err.message || 'No se pudo procesar la solicitud. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, enviado, error, loading, handleSubmit };
};
