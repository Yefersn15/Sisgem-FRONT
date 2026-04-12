// src/pages/proveedores/ProveedorCreate.jsx
import { useNavigate } from 'react-router-dom';
import ProveedorForm from './ProveedorForm';
import { createProveedor } from '../../services/dataService';

const ProveedorCreate = () => {
  const navigate = useNavigate();

  const handleCreate = (data) => {
    try {
      createProveedor(data);
      alert('Proveedor creado exitosamente');
      navigate('/admin/proveedores');
    } catch (err) {
      alert(err.message || 'Error creando proveedor');
    }
  };

  return (
    <div className="container my-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/admin/proveedores')}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div>
          <h2>Nuevo Proveedor</h2>
          <p className="text-muted mb-0">Los campos con (*) son obligatorios</p>
        </div>
      </div>
      <ProveedorForm onSubmit={handleCreate} submitLabel="Crear Proveedor" />
    </div>
  );
};

export default ProveedorCreate;