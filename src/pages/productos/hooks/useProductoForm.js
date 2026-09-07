// src/pages/productos/hooks/useProductoForm.js
// Cubre tanto crear como editar: sin `id` crea un producto nuevo, con `id`
// carga el producto existente y actualiza. Evita duplicar la carga/guardado
// entre ProductoCreate y ProductoEdit.
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductoById, createProducto, updateProducto } from '../services/productosService';
import { resolverImagenPendiente } from '../../../components/upload/useImageUpload';

const FORM_INICIAL = {
  nombre: '',
  descripcion: '',
  precioUnitario: '',
  stockDisponible: '',
  barcode: '',
  fotoUrl: '',
  categoriaId: '',
  marcaId: '',
  activo: true,
  minStock: 1,
};

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

export const useProductoForm = (id) => {
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState(isEdit ? null : FORM_INICIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [fetchError, setFetchError] = useState('');
  const fotoRef = useRef(null);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const producto = await getProductoById(id);
        if (!producto) {
          setFetchError('Producto no encontrado');
          return;
        }
        setFormData(producto);
      } catch (err) {
        console.error('Error cargando producto:', err);
        setFetchError('Error al cargar datos');
      } finally {
        setLoadingData(false);
      }
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
    const validationErrors = validateProducto(formData);
    setErrors(validationErrors);
    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const foto = await resolverImagenPendiente(fotoRef, formData.fotoUrl);
      if (!foto.ok) {
        setErrors((prev) => ({ ...prev, fotoUrl: 'No se pudo subir la imagen, intenta de nuevo' }));
        return;
      }

      if (isEdit) {
        await updateProducto(id, {
          ...formData,
          fotoUrl: foto.url,
          precioUnitario: parseFloat(formData.precioUnitario),
          stockDisponible: parseInt(formData.stockDisponible),
        });
      } else {
        await createProducto({
          ...formData,
          fotoUrl: foto.url,
          precioUnitario: parseFloat(formData.precioUnitario),
          stockDisponible: parseInt(formData.stockDisponible),
          minStock: parseInt(formData.minStock),
        });
      }
      navigate('/productos');
    } catch (err) {
      console.error(err);
      setErrors({ submit: err.message || `Error al ${isEdit ? 'actualizar' : 'crear'} producto` });
    } finally {
      setLoading(false);
    }
  };

  return { formData, errors, handleChange, validate, loading, loadingData, fetchError, handleSubmit, fotoRef };
};
