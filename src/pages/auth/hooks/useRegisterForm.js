// src/pages/auth/hooks/useRegisterForm.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../usuarios/services/usuariosService';
import { normalizeText } from '../../usuarios/hooks/textUtils';
import { useToast } from '../../../context/ToastContext';
import { passwordEsValida } from '../../../validations/password';
import { emailEsValido } from '../../../validations/email';
import { documentoEsValido, mensajeDocumentoInvalido } from '../../../validations/documento';

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

export const TOTAL_PASOS = 3;

export const useRegisterForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(FORM_INICIAL);
  const [paso, setPaso] = useState(1);
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

  // Cada paso se valida antes de avanzar, así el usuario nunca llega a
  // "Registrarse" arrastrando un error de un paso anterior que ya no ve.
  const validarPaso = (numeroPaso) => {
    if (numeroPaso === 1) {
      if (!form.nombre.trim() || !form.apellido.trim()) {
        return 'Completa nombre y apellido';
      }
      if (!documentoEsValido(form.documento, form.tipoDocumento)) {
        return mensajeDocumentoInvalido(form.tipoDocumento);
      }
      return '';
    }
    if (numeroPaso === 3) {
      if (!emailEsValido(form.email)) {
        return 'Ingresa un correo electrónico válido';
      }
      if (form.password !== form.confirmPassword) {
        return 'Las contraseñas no coinciden';
      }
      if (!passwordEsValida(form.password)) {
        return 'La contraseña debe tener mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo';
      }
      return '';
    }
    return '';
  };

  const siguientePaso = () => {
    const mensaje = validarPaso(paso);
    if (mensaje) {
      setError(mensaje);
      return;
    }
    setError('');
    setPaso((p) => Math.min(p + 1, TOTAL_PASOS));
  };

  const pasoAnterior = () => {
    setError('');
    setPaso((p) => Math.max(p - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const mensaje = validarPaso(3);
    if (mensaje) {
      setError(mensaje);
      return;
    }

    setError('');
    setLoading(true);

    try {
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

  return { form, paso, error, loading, handleChange, siguientePaso, pasoAnterior, handleSubmit };
};
