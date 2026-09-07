// src/pages/carrito/hooks/useCheckoutForm.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { createPedido } from '../../../services/api/pedidos.api';
import { useToast } from '../../../context/ToastContext';
import { useCheckoutDireccion } from './useCheckoutDireccion';

export const useCheckoutForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { cartItemsWithDetails, clearCart } = useCart();
  const { user } = useAuth();

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

  const checkoutDireccion = useCheckoutDireccion({ user, setFormData, toast });

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
    ...checkoutDireccion,
    formData,
    errors,
    subtotal,
    total,
    submitting,
    handleChange,
    handleSubmit,
  };
};
