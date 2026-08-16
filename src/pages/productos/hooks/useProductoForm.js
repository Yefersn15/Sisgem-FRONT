// src/pages/productos/hooks/useProductoForm.js
import { useState } from 'react';

const validateProducto = (formData) => {
  const errors = {};
  if (!formData.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
  else if (formData.nombre.length > 200) errors.nombre = 'Máximo 200 caracteres';
  if (!formData.descripcion.trim()) errors.descripcion = 'La descripción es obligatoria';
  else if (formData.descripcion.length > 1000) errors.descripcion = 'Máximo 1000 caracteres';
  if (!formData.precioUnitario) errors.precioUnitario = 'El precio es obligatorio';
  else if (parseFloat(formData.precioUnitario) <= 0) errors.precioUnitario = 'Debe ser mayor a 0';
  if (!formData.stockDisponible && formData.stockDisponible !== 0) errors.stockDisponible = 'El stock es obligatorio';
  else if (parseInt(formData.stockDisponible) < 0) errors.stockDisponible = 'No puede ser negativo';
  if (!formData.categoriaId) errors.categoriaId = 'Selecciona una categoría';
  if (!formData.marcaId) errors.marcaId = 'Selecciona una marca';
  return errors;
};

export const useProductoForm = (initialData) => {
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
    const validationErrors = validateProducto(formData);
    setErrors(validationErrors);
    return validationErrors;
  };

  return { formData, setFormData, errors, setErrors, handleChange, validate };
};
