// src/pages/banners/hooks/useBannerForm.js
import { useState } from 'react';
import { getTemplate } from './bannerTemplates';

const FORM_INICIAL = {
  layout: 'single',
  images: [{ slot: 0, url: '' }],
  titulo: '',
  texto: '',
  textPosition: 'none',
  displayOrder: 0,
  estado: true,
};

export const useBannerForm = (initialData) => {
  const [form, setForm] = useState(initialData || FORM_INICIAL);
  const [errors, setErrors] = useState({});

  const setLayout = (layout) => {
    const slots = getTemplate(layout).slots;
    setForm(prev => {
      const images = Array.from({ length: slots }, (_, i) => prev.images[i] || { slot: i, url: '' });
      return { ...prev, layout, images };
    });
  };

  const setImageUrl = (slotIndex, url) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.map((img, i) => (i === slotIndex ? { ...img, url } : img)),
    }));
  };

  const setField = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (form.images.some(img => !img.url?.trim())) {
      newErrors.images = 'Todas las casillas de imagen deben tener una URL';
    }
    if (form.textPosition !== 'none' && !form.titulo?.trim() && !form.texto?.trim()) {
      newErrors.texto = 'Agrega un título o texto, o elige "Sin texto"';
    }
    setErrors(newErrors);
    return newErrors;
  };

  return { form, setForm, errors, setLayout, setImageUrl, setField, validate };
};
