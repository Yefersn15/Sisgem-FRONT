// src/pages/usuarios/hooks/usePerfilForm.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { updateUsuario } from '../services/usuariosService';

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
    documento: ''
  });
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
          documento: user.documento || ''
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
      await updateUsuario(user.documento, {
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        email: form.email
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
      documento: perfil.documento || ''
    });
  };

  return { perfil, loading, editMode, setEditMode, form, success, error, submitting, handleChange, handleSubmit, cancelEdit };
};
