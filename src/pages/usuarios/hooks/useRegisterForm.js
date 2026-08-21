// src/pages/usuarios/hooks/useRegisterForm.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/usuariosService';
import { normalizeText } from './textUtils';
import { useToast } from '../../../context/ToastContext';

const FORM_INICIAL = {
  nombre: '',
  apellido: '',
  tipoDocumento: 'CC',
  documento: '',
  genero: 'Otro',
  celular: '',
  direccion: '',
  barrio: '',
  email: '',
  password: '',
  confirmPassword: ''
};

export const useRegisterForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(FORM_INICIAL);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (['nombre', 'apellido', 'direccion', 'barrio'].includes(name)) {
      processedValue = normalizeText(value);
    } else if (name === 'documento') {
      processedValue = value.toUpperCase();
    }

    setForm({ ...form, [name]: processedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (form.password !== form.confirmPassword) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }

      const pw = form.password || '';
      if (pw.length < 6) {
        setError('La contraseña debe tener mínimo 6 caracteres');
        setLoading(false);
        return;
      }

      const result = await registerUser({
        nombre: normalizeText(form.nombre),
        apellido: normalizeText(form.apellido),
        tipoDocumento: form.tipoDocumento,
        documento: form.documento.toUpperCase(),
        genero: form.genero,
        telefono: form.celular,
        direccion: form.direccion ? normalizeText(form.direccion) : '',
        barrio: form.barrio ? normalizeText(form.barrio) : '',
        email: form.email.toLowerCase().trim(),
        password: form.password
      });

      // La API retorna null en data si fue exitoso
      if (result === null || result) {
        toast.success('Registro exitoso. Por favor inicia sesión.');
        navigate('/login');
      } else {
        setError('Error al registrar. Intenta nuevamente.');
      }
    } catch (err) {
      setError(err.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return { form, error, loading, handleChange, handleSubmit };
};
