// src/pages/pagos/hooks/usePagoCreate.js
import { useNavigate } from 'react-router-dom';
import { createPago } from '../services/pagosService';
import { useToast } from '../../../context/ToastContext';

export const usePagoCreate = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (data) => {
    const result = await createPago(data);
    if (result) {
      navigate('/admin/pagos');
    } else {
      toast.error('Error al crear el pago');
    }
  };

  return { handleSubmit };
};
