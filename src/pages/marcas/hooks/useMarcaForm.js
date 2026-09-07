// src/pages/marcas/hooks/useMarcaForm.js
// Cubre tanto crear como editar: sin `id` crea una marca nueva, con `id`
// carga la marca existente y actualiza. Evita duplicar la carga/guardado
// entre MarcaCreate y MarcaEdit.
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMarcaById, createMarca, updateMarca } from '../services/marcasService';
import { resolverImagenPendiente } from '../../../components/upload/useImageUpload';

const FORM_INICIAL = {
  nombre: '',
  descripcion: '',
  logoUrl: '',
  sitioWeb: '',
  activo: true,
};

const validateMarca = (formData) => {
  const errors = {};
  if (!String(formData.nombre || '').trim()) errors.nombre = 'El nombre es obligatorio';
  else if (String(formData.nombre).length > 100) errors.nombre = 'Máximo 100 caracteres';
  if (formData.descripcion && String(formData.descripcion).length > 500) errors.descripcion = 'Máximo 500 caracteres';
  if (formData.sitioWeb && !/^https?:\/\/.+\..+/.test(String(formData.sitioWeb))) errors.sitioWeb = 'URL inválida';
  return errors;
};

export const useMarcaForm = (id) => {
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState(isEdit ? null : FORM_INICIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [fetchError, setFetchError] = useState('');
  const logoRef = useRef(null);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const marca = await getMarcaById(id);
      if (!marca) {
        setFetchError('Marca no encontrada');
        setLoadingData(false);
        return;
      }
      setFormData(marca);
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
    const validationErrors = validateMarca(formData || {});
    setErrors(validationErrors);
    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const logo = await resolverImagenPendiente(logoRef, formData.logoUrl);
      if (!logo.ok) {
        setErrors((prev) => ({ ...prev, logoUrl: 'No se pudo subir el logo, intenta de nuevo' }));
        return;
      }
      const datosAGuardar = { ...formData, logoUrl: logo.url };
      if (isEdit) await updateMarca(id, datosAGuardar);
      else await createMarca(datosAGuardar);
      navigate('/marcas');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { formData, errors, handleChange, validate, loading, loadingData, fetchError, handleSubmit, logoRef };
};
