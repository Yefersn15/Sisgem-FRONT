// src/pages/banners/hooks/useBannerForm.js
// Cubre tanto crear como editar: sin `id` crea un banner nuevo, con `id`
// carga el banner existente y actualiza. Evita duplicar la carga/guardado
// entre BannerCreate y BannerEdit.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTemplate } from './bannerTemplates';
import { getBannerById, createBanner, updateBanner } from '../services/bannersService';
import { getProductos } from '../../productos/services/productosService';
import { getMarcas } from '../../marcas/services/marcasService';
import { getCategorias } from '../../categorias/services/categoriasService';
import { useToast } from '../../../context/ToastContext';

const FORM_INICIAL = {
  layout: 'single',
  images: [{ slot: 0, url: '' }],
  contentType: 'imagenes',
  contentRefs: null,
  titulo: '',
  texto: '',
  textPosition: 'none',
  displayOrder: 0,
  estado: true,
};

export const useBannerForm = (id) => {
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(isEdit ? null : FORM_INICIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [fetchError, setFetchError] = useState('');

  const [productos, setProductos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    Promise.all([getProductos(), getMarcas(), getCategorias()])
      .then(([p, m, c]) => {
        setProductos(p);
        setMarcas(m);
        setCategorias(c);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const banner = await getBannerById(id);
      if (!banner) {
        setFetchError('Banner no encontrado');
        setLoadingData(false);
        return;
      }
      const contentType = banner.contentType || 'imagenes';
      setForm({
        layout: banner.layout,
        images: banner.images || [],
        contentType,
        contentRefs: banner.contentRefs ?? (contentType === 'productos' || contentType === 'marcas' ? [] : null),
        titulo: banner.titulo || '',
        texto: banner.texto || '',
        textPosition: banner.textPosition || 'none',
        displayOrder: banner.displayOrder || 0,
        estado: banner.estado !== false,
      });
      setLoadingData(false);
    })();
  }, [id]);

  const setLayout = (layout) => {
    const slots = getTemplate(layout).slots;
    setForm(prev => {
      const images = Array.from({ length: slots }, (_, i) => prev.images[i] || { slot: i, url: '' });
      const contentRefs = Array.isArray(prev.contentRefs) ? prev.contentRefs.slice(0, slots) : prev.contentRefs;
      return { ...prev, layout, images, contentRefs };
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

  // Al cambiar de tipo de contenido se reinicia contentRefs a la forma que
  // corresponde (arreglo de ids para productos/marcas, {refId,limit} para
  // populares) para no arrastrar la selección de un tipo anterior distinto.
  const setContentType = (contentType) => {
    setForm(prev => {
      if (contentType === 'imagenes') return { ...prev, contentType, contentRefs: null };
      if (contentType === 'productos' || contentType === 'marcas') return { ...prev, contentType, contentRefs: [] };
      return { ...prev, contentType, contentRefs: { refId: '', limit: getTemplate(prev.layout).slots } };
    });
  };

  const setContentRefs = (contentRefs) => setForm(prev => ({ ...prev, contentRefs }));

  const validate = () => {
    const newErrors = {};
    if (form.contentType === 'imagenes' && form.images.some(img => !img.url?.trim())) {
      newErrors.images = 'Todas las casillas de imagen deben tener una URL';
    }
    if ((form.contentType === 'productos' || form.contentType === 'marcas') && (!form.contentRefs || form.contentRefs.length === 0)) {
      newErrors.contentRefs = `Selecciona al menos ${form.contentType === 'productos' ? 'un producto' : 'una marca'}`;
    }
    if ((form.contentType === 'populares_marca' || form.contentType === 'populares_categoria') && !form.contentRefs?.refId) {
      newErrors.contentRefs = `Selecciona ${form.contentType === 'populares_marca' ? 'una marca' : 'una categoría'} de referencia`;
    }
    if (form.textPosition !== 'none' && !form.titulo?.trim() && !form.texto?.trim()) {
      newErrors.texto = 'Agrega un título o texto, o elige "Sin texto"';
    }
    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      if (isEdit) await updateBanner(id, form);
      else await createBanner(form);
      navigate('/admin/banners');
    } catch (err) {
      toast.error(`Error al ${isEdit ? 'actualizar' : 'crear'} banner: ` + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return {
    form, errors, setLayout, setImageUrl, setField, setContentType, setContentRefs,
    productos, marcas, categorias,
    loading, loadingData, fetchError, handleSubmit,
  };
};
