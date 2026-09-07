// src/pages/auth/hooks/useLoginForm.js
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, esAdmin } from '../../../context/AuthContext';

export const useLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result && result.success) {
        // El staff siempre entra por el panel de administración; a un
        // usuario normal se le devuelve a la página desde la que lo
        // mandamos a loguearse (ver PrivateRoute.jsx, mismo criterio).
        navigate(esAdmin(result.user) ? '/admin' : from, { replace: true });
      } else {
        setError(result?.message || 'Credenciales inválidas');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, password, setPassword, error, loading, handleSubmit };
};
