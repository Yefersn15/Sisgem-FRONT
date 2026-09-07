// src/pages/categorias/hooks/useCategoriaForm.js
// Cubre tanto crear como editar: sin `id` crea una categoría nueva, con `id`
// carga la categoría existente y actualiza. Evita duplicar la carga/guardado
// entre CategoriaCreate y CategoriaEdit.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategoriaById, createCategoria, updateCategoria } from '../services/categoriasService';

const FORM_INICIAL = {
  nombre: '',
  descripcion: '',
  activo: true,
};

const validateCategoria = (formData) => {
  const errors = {};
  if (!String(formData.nombre || '').trim()) errors.nombre = 'El nombre es obligatorio';
  else if (String(formData.nombre).length > 100) errors.nombre = 'Máximo 100 caracteres';
  if (formData.descripcion && String(formData.descripcion).length > 500) errors.descripcion = 'Máximo 500 caracteres';
  return errors;
};

export const useCategoriaForm = (id) => {
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState(isEdit ? null : FORM_INICIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const categoria = await getCategoriaById(id);
      if (!categoria) {
        setFetchError('Categoría no encontrada');
        setLoadingData(false);
        return;
      }
      setFormData(categoria);
      setLoadingData(false);
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const validationErrors = validateCategoria(formData || {});
    setErrors(validationErrors);
    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      if (isEdit) await updateCategoria(id, formData);
      else await createCategoria(formData);
      navigate('/categorias');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { formData, errors, handleChange, validate, loading, loadingData, fetchError, handleSubmit };
};
