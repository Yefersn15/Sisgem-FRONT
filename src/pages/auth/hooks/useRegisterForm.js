// src/pages/auth/hooks/useRegisterForm.js
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../usuarios/services/usuariosService';
import { normalizeText } from '../../usuarios/hooks/textUtils';
import { useToast } from '../../../context/ToastContext';
import { passwordEsValida } from '../../../validations/password';
import { emailEsValido } from '../../../validations/email';
import { documentoEsValido } from '../../../validations/documento';
import { resolverImagenPendiente } from '../../../components/upload/useImageUpload';

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
  confirmPassword: '',
  fotoUrl: '',
};

export const TOTAL_PASOS = 3;

export const useRegisterForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(FORM_INICIAL);
  // La foto elegida solo se sube a Cloudinary al enviar el paso 3 (ver
  // handleSubmit), nunca antes: si el usuario abandona el registro sin
  // terminarlo, esa imagen nunca llega a subirse.
  const fotoUrlRef = useRef(null);
  const [paso, setPaso] = useState(1);
  // Pasos donde el usuario ya intentó avanzar/enviar con datos inválidos:
  // recién ahí cada campo del paso empieza a mostrar su propio mensaje de
  // error debajo (ver InformacionPersonalForm/CredencialesForm), en vez de
  // un único mensaje genérico arriba del formulario.
  const [pasosConIntento, setPasosConIntento] = useState({});
  const [error, setError] = useState(''); // solo errores del envío a la API, no de validación de campos
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

  const pasoEsValido = (numeroPaso) => {
    if (numeroPaso === 1) {
      return Boolean(form.nombre.trim() && form.apellido.trim() && documentoEsValido(form.documento, form.tipoDocumento));
    }
    if (numeroPaso === 3) {
      return Boolean(
        emailEsValido(form.email) &&
        form.password === form.confirmPassword &&
        passwordEsValida(form.password)
      );
    }
    return true;
  };

  const siguientePaso = () => {
    if (!pasoEsValido(paso)) {
      setPasosConIntento((prev) => ({ ...prev, [paso]: true }));
      return;
    }
    setPaso((p) => Math.min(p + 1, TOTAL_PASOS));
  };

  const pasoAnterior = () => {
    setPaso((p) => Math.max(p - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pasoEsValido(3)) {
      setPasosConIntento((prev) => ({ ...prev, 3: true }));
      return;
    }

    setError('');
    setLoading(true);

    try {
      const fotoResuelta = await resolverImagenPendiente(fotoUrlRef, form.fotoUrl);
      if (!fotoResuelta.ok) {
        setError('No se pudo subir la foto de perfil, intenta de nuevo');
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
        password: form.password,
        fotoUrl: fotoResuelta.url,
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

  return {
    form,
    paso,
    error,
    loading,
    mostrarErrores: Boolean(pasosConIntento[paso]),
    fotoUrlRef,
    handleChange,
    siguientePaso,
    pasoAnterior,
    handleSubmit,
  };
};
