// src/pages/carrito/hooks/useCheckoutForm.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { createPedido } from '../../../services/api/pedidos.api';
import { getDirecciones, createDireccion } from '../../../services/api/usuarios.api';
import { useToast } from '../../../context/ToastContext';

export const useCheckoutForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { cartItemsWithDetails, clearCart } = useCart();
  const { user } = useAuth();

  const [direcciones, setDirecciones] = useState([]);
  const [selectedDireccionId, setSelectedDireccionId] = useState('');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ direccion: '', barrio: '', telefono: '', tipo: 'casa' });

  const [formData, setFormData] = useState({
    direccion: '',
    direccion2: '',
    barrio: '',
    telefono: '',
    countryCode: '57',
    notasDomicilio: '',
    delivery: false,
    metodoPago: 'Abono',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadDirecciones = async () => {
      if (user && user.documento) {
        try {
          const dirs = await getDirecciones();
          setDirecciones(dirs || []);
          if (!selectedDireccionId) {
            setSelectedDireccionId('registered');
            setFormData(prev => ({
              ...prev,
              direccion: user.direccion || '',
              barrio: user.barrio || '',
              telefono: user.telefono || user.celular || ''
            }));
          }
        } catch (err) {
          console.error('Error cargando direcciones:', err);
        }
      }
    };
    loadDirecciones();
  }, [user]);

  useEffect(() => {
    if (user && !formData.telefono) {
      setFormData(prev => ({
        ...prev,
        telefono: user.telefono || user.celular || ''
      }));
    }
  }, [user]);

  const subtotal = cartItemsWithDetails.reduce(
    (sum, item) => sum + (item.producto.precio || 0) * item.cantidad,
    0
  );

  const shipping = 0; // se asigna después por admin
  const total = subtotal;

  useEffect(() => {
    if (cartItemsWithDetails.length === 0) {
      navigate('/carrito');
    }
  }, [cartItemsWithDetails, navigate]);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      if (name === 'metodoPago') {
        setErrors(prev => ({
          ...prev,
          cardNumber: '',
          cardExpiry: '',
          cardCvv: '',
          cardName: ''
        }));
      }
      return newData;
    });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDireccionSelect = (e) => {
    const id = e.target.value;
    if (id === 'new') {
      setShowNewAddress(true);
      setSelectedDireccionId(id);
      setFormData(prev => ({ ...prev, direccion: '', barrio: '', telefono: '' }));
    } else if (id === 'registered') {
      setShowNewAddress(false);
      setSelectedDireccionId(id);
      setFormData(prev => ({
        ...prev,
        direccion: user.direccion || '',
        barrio: user.barrio || '',
        telefono: user.telefono || user.celular || ''
      }));
    } else {
      setShowNewAddress(false);
      setSelectedDireccionId(id);
      const dir = direcciones.find(d => String(d.id) === String(id));
      if (dir) {
        setFormData(prev => ({
          ...prev,
          direccion: dir.direccion,
          barrio: dir.barrio,
          telefono: dir.telefono || prev.telefono,
          direccion2: dir.tipo || ''
        }));
      }
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.direccion?.trim()) {
      toast.error('La dirección es obligatoria');
      return;
    }

    if (!user) {
      toast.error('Debe iniciar sesión para guardar una dirección');
      return;
    }

    if (direcciones.length >= 3) {
      toast.error('Máximo 3 direcciones guardadas. Por favor elimina una para agregar una nueva.');
      return;
    }

    const dirData = {
      nombre: `${newAddress.direccion} ${newAddress.barrio || ''}`.trim(),
      direccion: newAddress.direccion,
      barrio: newAddress.barrio || '',
      telefono: newAddress.telefono || user.telefono || user.celular || '',
      tipo: newAddress.tipo || 'casa',
      es_predeterminada: direcciones.length === 0
    };

    try {
      const respuesta = await createDireccion(dirData);
      let nuevaDir = respuesta;
      let guardadaExitosamente = false;

      if (Array.isArray(respuesta) && respuesta.length > 0) {
        const dirText = (newAddress.direccion || '').toLowerCase().trim();
        const found = respuesta.find(d => (d.direccion || '').toLowerCase().trim() === dirText);
        if (found) {
          nuevaDir = found;
          guardadaExitosamente = true;
        } else {
          nuevaDir = respuesta[respuesta.length - 1];
          guardadaExitosamente = Boolean(nuevaDir?.id || nuevaDir?._id);
        }
      } else if (respuesta && (respuesta.id || respuesta._id)) {
        guardadaExitosamente = true;
      }

      if (guardadaExitosamente && nuevaDir) {
        setDirecciones(prev => [...prev, nuevaDir]);
        setSelectedDireccionId(nuevaDir.id || nuevaDir._id);
        setFormData(prev => ({
          ...prev,
          direccion: nuevaDir.direccion || newAddress.direccion,
          barrio: nuevaDir.barrio || newAddress.barrio,
          telefono: nuevaDir.telefono || newAddress.telefono || user.telefono || user.celular || ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          direccion: newAddress.direccion,
          barrio: newAddress.barrio,
          telefono: newAddress.telefono || user.telefono || user.celular || ''
        }));
      }
    } catch (e) {
      console.error('Error agregando dirección:', e);
      setFormData(prev => ({
        ...prev,
        direccion: newAddress.direccion,
        barrio: newAddress.barrio,
        telefono: newAddress.telefono || user.telefono || user.celular || ''
      }));
    }
    setShowNewAddress(false);
    setNewAddress({ direccion: '', barrio: '', telefono: '', tipo: 'casa' });
  };

  const validate = () => {
    const newErrors = {};
    if (formData.delivery) {
      if (!formData.direccion?.trim()) newErrors.direccion = 'La dirección es obligatoria';
      if (!formData.telefono?.trim()) newErrors.telefono = 'El teléfono es obligatorio';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      const validationErrors = validate();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setSubmitting(true);

      const productos = cartItemsWithDetails
        .filter(item => item.producto && (item.producto.id || item.producto._id))
        .map(item => {
          const productoId = item.producto.id || item.producto._id;
          return {
            producto: productoId,
            cantidad: item.cantidad,
            precio_unitario: item.producto.precio
          };
        });

      const estado = 'Pendiente';

      const cleanedPhone = (formData.telefono || '').toString().replace(/\D/g, '');
      const prefix = (formData.countryCode || '').toString().replace(/\D/g, '');
      const telefonoCompleto = `${prefix}${cleanedPhone}`;

      const payload = {
        telefono_contacto: telefonoCompleto,
        subtotal,
        shipping,
        total,
        metodo_pago: formData.metodoPago,
        estado,
        productos,
        notasDomicilio: formData.notasDomicilio || '',
        notasAutor: formData.delivery ? 'usuario' : undefined,
        delivery: formData.delivery,
        direccion: formData.delivery ? {
          direccion: formData.direccion,
          direccion2: formData.direccion2 || '',
          barrio: formData.barrio,
          telefono: telefonoCompleto,
          tipo: formData.direccion2 || 'casa'
        } : null,
        tipo_venta: formData.delivery ? 'domicilio' : 'mostrador'
      };

      const pedidoCreado = await createPedido(payload);
      if (!pedidoCreado || !pedidoCreado.id) {
        throw new Error('No se pudo crear el pedido correctamente');
      }
      clearCart();
      navigate(`/pedidos/${pedidoCreado.id}`);
    } catch (error) {
      console.error('Error al crear la venta:', error);
      toast.error('Error al procesar el pedido: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    user,
    cartItemsWithDetails,
    direcciones,
    selectedDireccionId,
    showNewAddress,
    setShowNewAddress,
    newAddress,
    setNewAddress,
    formData,
    errors,
    subtotal,
    total,
    submitting,
    handleChange,
    handleDireccionSelect,
    handleAddAddress,
    handleSubmit,
  };
};
