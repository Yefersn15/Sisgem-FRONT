// src/pages/usuarios/hooks/useUsuarioForm.js
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsuarioById, createUsuario, updateUsuario, getUsuarios } from '../services/usuariosService';
import { getRoles } from '../../roles/services/rolesService';
import { normalizeText } from './textUtils';
import { passwordEsValida } from '../../../validations/password';
import { emailEsValido } from '../../../validations/email';
import { documentoEsValido, mensajeDocumentoInvalido } from '../../../validations/documento';
import { resolverImagenPendiente } from '../../../components/upload/useImageUpload';

const FORM_INICIAL = {
  nombre: '',
  apellido: '',
  tipoDocumento: 'CC',
  documento: '',
  genero: 'Otro',
  telefono: '',
  direccion: '',
  barrio: '',
  email: '',
  password: '',
  confirmPassword: '',
  rolId: '',
  estado: true,
  fotoUrl: '',
};

export const useUsuarioForm = (id) => {
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [error, setError] = useState('');
  const [documentoExists, setDocumentoExists] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const fotoUrlRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rolesData = await getRoles();
        setRoles(rolesData);

        if (isEditing) {
          const usuario = await getUsuarioById(id);
          if (usuario) {
            setForm({
              nombre: usuario.nombre || '',
              apellido: usuario.apellido || '',
              tipoDocumento: usuario.tipoDocumento || usuario.tipo_documento || 'CC',
              documento: usuario.documento || '',
              genero: usuario.genero || 'Otro',
              telefono: usuario.telefono || '',
              direccion: usuario.direccion || '',
              barrio: usuario.barrio || '',
              email: usuario.email || '',
              password: '',
              confirmPassword: '',
              rolId: usuario.rol?.id || usuario.rol_id || '',
              estado: usuario.estado !== false,
              fotoUrl: usuario.fotoUrl || ''
            });
          }
        } else {
          const defaultRole = rolesData.find(r => r.esDefault);
          if (defaultRole) {
            setForm(prev => ({ ...prev, rolId: defaultRole.id }));
          }
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
        setLoadError(err.message || 'Error desconocido');
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [id, isEditing]);

  const checkDocumentoExists = async (doc) => {
    if (!doc || isEditing) return;
    const usuarios = await getUsuarios();
    const exists = usuarios.some(u => u.documento === doc);
    setDocumentoExists(exists);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (['nombre', 'apellido', 'direccion', 'barrio'].includes(name)) {
      processedValue = normalizeText(value);
    } else if (name === 'documento') {
      processedValue = value.toUpperCase();
    }

    setForm({ ...form, [name]: processedValue });

    if (name === 'documento') {
      checkDocumentoExists(processedValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.nombre.trim() || !form.apellido.trim()) {
      setError('El nombre y apellido son requeridos');
      return;
    }

    if (!emailEsValido(form.email)) {
      setError('Ingresa un correo electrónico válido');
      return;
    }

    if (!isEditing) {
      if (!documentoEsValido(form.documento, form.tipoDocumento)) {
        setError(mensajeDocumentoInvalido(form.tipoDocumento));
        return;
      }
      if (documentoExists) {
        setError('El número de documento ya está registrado');
        return;
      }
      if (!passwordEsValida(form.password)) {
        setError('La contraseña debe tener mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
    } else {
      if (form.password && !passwordEsValida(form.password)) {
        setError('La contraseña debe tener mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
    }

    if (!form.rolId) {
      setError('Debe seleccionar un rol');
      return;
    }

    setLoading(true);
    try {
      const fotoResuelta = await resolverImagenPendiente(fotoUrlRef, form.fotoUrl);
      if (!fotoResuelta.ok) {
        setError('No se pudo subir la foto de perfil, intenta de nuevo');
        return;
      }

      const userData = {
        nombre: normalizeText(form.nombre),
        apellido: normalizeText(form.apellido),
        tipoDocumento: form.tipoDocumento,
        documento: form.documento.toUpperCase(),
        genero: form.genero,
        telefono: form.telefono,
        direccion: form.direccion ? normalizeText(form.direccion) : '',
        barrio: form.barrio ? normalizeText(form.barrio) : '',
        email: form.email.toLowerCase().trim(),
        rolId: form.rolId,
        estado: form.estado,
        fotoUrl: fotoResuelta.url
      };

      if (!isEditing) {
        userData.password = form.password;
      } else if (form.password) {
        userData.password = form.password;
      }

      if (isEditing) {
        await updateUsuario(id, userData);
      } else {
        await createUsuario(userData);
      }

      navigate('/admin/usuarios');
    } catch (err) {
      setError(err.message || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  return {
    isEditing,
    roles,
    loading,
    loadingData,
    loadError,
    error,
    documentoExists,
    form,
    setForm,
    fotoUrlRef,
    handleChange,
    handleSubmit,
  };
};
