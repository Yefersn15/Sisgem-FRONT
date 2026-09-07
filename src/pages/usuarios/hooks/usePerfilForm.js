// src/pages/usuarios/hooks/usePerfilForm.js
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { updateUsuario } from '../services/usuariosService';
import { resolverImagenPendiente } from '../../../components/upload/useImageUpload';

export const usePerfilForm = () => {
  const { user, refreshUser } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    documento: '',
    fotoUrl: ''
  });
  const fotoUrlRef = useRef(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPerfil = async () => {
      if (user && user.documento) {
        setPerfil(user);
        setForm({
          nombre: user.nombre || '',
          apellido: user.apellido || '',
          telefono: user.telefono || '',
          email: user.email || '',
          documento: user.documento || '',
          fotoUrl: user.fotoUrl || ''
        });
      }
      setLoading(false);
    };
    fetchPerfil();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setSubmitting(true);
    try {
      const fotoResuelta = await resolverImagenPendiente(fotoUrlRef, form.fotoUrl);
      if (!fotoResuelta.ok) {
        setError('No se pudo subir la foto de perfil, intenta de nuevo');
        return;
      }

      await updateUsuario(user.documento, {
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        email: form.email,
        fotoUrl: fotoResuelta.url
      });

      await refreshUser();

      setSuccess('Información actualizada correctamente');
      setEditMode(false);
    } catch (err) {
      setError('Error al actualizar la información: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setForm({
      nombre: perfil.nombre || '',
      apellido: perfil.apellido || '',
      telefono: perfil.telefono || '',
      email: perfil.email || '',
      documento: perfil.documento || '',
      fotoUrl: perfil.fotoUrl || ''
    });
  };

  return { perfil, loading, editMode, setEditMode, form, fotoUrlRef, success, error, submitting, handleChange, handleSubmit, cancelEdit };
};
