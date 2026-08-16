// src/pages/categorias/hooks/useCategoriaForm.js
import { useState } from 'react';

const validateCategoria = (formData) => {
  const errors = {};
  if (!String(formData.nombre || '').trim()) errors.nombre = 'El nombre es obligatorio';
  else if (String(formData.nombre).length > 100) errors.nombre = 'Máximo 100 caracteres';
  if (formData.descripcion && String(formData.descripcion).length > 500) errors.descripcion = 'Máximo 500 caracteres';
  return errors;
};

export const useCategoriaForm = (initialData) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

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

  return { formData, setFormData, errors, handleChange, validate };
};
