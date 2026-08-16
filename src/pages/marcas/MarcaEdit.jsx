import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMarcaById, updateMarca, assignProveedorToMarca } from './services/marcasService';
import { getProveedores } from '../../services/dataService';
import { useMarcaForm } from './hooks/useMarcaForm';
import MarcaFormFields from './components/MarcaFormFields';

const MarcaEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formData, setFormData, errors, handleChange, validate } = useMarcaForm(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [proveedores, setProveedores] = useState([]);
  const [selectedProveedor, setSelectedProveedor] = useState('');

  useEffect(() => {
    (async () => {
      const marca = await getMarcaById(id);
      if (!marca) {
        setFetchError('Marca no encontrada');
        return;
      }
      setFormData(marca);
      setSelectedProveedor(marca.proveedorId || '');
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const list = (await getProveedores()) || [];
        setProveedores(list);
      } catch (e) {
        setProveedores([]);
      }
    })();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    (async () => {
      try {
        await updateMarca(id, formData);
        const provId = selectedProveedor || null;
        if (String(formData.proveedorId || '') !== String(provId || '')) {
          await assignProveedorToMarca(id, provId, true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
      navigate('/marcas');
    })();
  };

  if (fetchError) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{fetchError}</div>
        <button className="btn btn-primary" onClick={() => navigate('/marcas')}>Volver</button>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0"><i className="fas fa-industry me-2"></i>Editar Marca: {formData.nombre}</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <MarcaFormFields
              formData={formData}
              errors={errors}
              onChange={handleChange}
              proveedores={proveedores}
              selectedProveedor={selectedProveedor}
              onProveedorChange={(e) => setSelectedProveedor(e.target.value)}
            />

            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button type="submit" className="btn btn-primary me-md-2" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>Guardar Cambios
                  </>
                )}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/marcas')}>
                <i className="fas fa-times me-2"></i>Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MarcaEdit;
