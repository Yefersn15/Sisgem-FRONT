import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PagoForm from './components/PagoForm';
import { createPago } from './services/pagosService';
import { useToast } from '../../context/ToastContext';

const PagoCreate = () => {
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

  const location = useLocation();
  const initial = { ventaId: location.state?.ventaId, fecha: new Date().toISOString().slice(0,16), metodo: 'Abono' };

  return (
    <div className="container mt-4">
      <h3>Registrar Pago</h3>
      <div className="card p-3 mt-3">
        <PagoForm initial={initial} onSubmit={handleSubmit} onCancel={() => navigate(-1)} />
      </div>
    </div>
  );
};

export default PagoCreate;