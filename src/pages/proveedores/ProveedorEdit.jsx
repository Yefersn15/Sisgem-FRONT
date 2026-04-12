// src/pages/proveedores/ProveedorEdit.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProveedorForm from './ProveedorForm';
import { getProveedorById, updateProveedor } from '../../services/dataService';

const ProveedorEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proveedor, setProveedor] = useState(null);

  useEffect(() => {
    const p = getProveedorById(id);
    if (!p) {
      alert('Proveedor no encontrado');
      navigate('/admin/proveedores');
      return;
    }
    setProveedor(p);
  }, [id]);

  const handleUpdate = (data) => {
    try {
      updateProveedor(id, data);
      alert('Proveedor actualizado');
      navigate('/admin/proveedores');
    } catch (err) {
      alert(err.message || 'Error actualizando');
    }
  };

  if (!proveedor) return null;

  return (
    <div className="container my-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/admin/proveedores')}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div>
          <h2>Editar Proveedor</h2>
          <p className="text-muted mb-0">Actualiza la información del proveedor</p>
        </div>
      </div>
      <ProveedorForm initial={proveedor} onSubmit={handleUpdate} submitLabel="Guardar cambios" />
    </div>
  );
};

export default ProveedorEdit;