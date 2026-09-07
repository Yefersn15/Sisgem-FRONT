import { useNavigate, useLocation } from 'react-router-dom';
import PagoForm from './components/PagoForm';
import { usePagoCreate } from './hooks/usePagoCreate';

const PagoCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleSubmit } = usePagoCreate();
  const initial = { ventaId: location.state?.ventaId, fecha: new Date().toISOString().slice(0, 16), metodo: 'Abono' };

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
