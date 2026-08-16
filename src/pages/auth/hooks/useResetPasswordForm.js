// src/pages/auth/hooks/useResetPasswordForm.js
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getUsuarioByEmail, updateUsuario } from '../services/authService';

export const useResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email || !token) {
      setError('Enlace inválido');
    } else {
      const storedToken = localStorage.getItem('reset_token_' + email);
      if (storedToken !== token) {
        setError('Enlace de recuperación inválido o expirado');
      }
    }
  }, [email, token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const usuario = getUsuarioByEmail(email);
      if (usuario) {
        updateUsuario(usuario.id, { password_hash: password });
        localStorage.removeItem('reset_token_' + email);
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError('Usuario no encontrado');
      }
    } catch (err) {
      setError(err.message || 'Error al actualizar contraseña');
    }
  };

  return { email, password, setPassword, confirmPassword, setConfirmPassword, error, success, handleSubmit };
};
