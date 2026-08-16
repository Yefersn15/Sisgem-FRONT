// src/pages/auth/hooks/useForgotPasswordForm.js
import { useState } from 'react';

export const useForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Ingresa tu email');
      return;
    }

    // Simulación de envío de email
    // En un sistema real, esto enviaría un email con un token
    const resetToken = Math.random().toString(36).substring(2);
    localStorage.setItem('reset_token_' + email, resetToken);

    setEnviado(true);
  };

  return { email, setEmail, enviado, error, handleSubmit };
};
