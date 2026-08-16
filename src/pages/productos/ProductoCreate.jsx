import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProducto } from './services/productosService';
import { useProductoForm } from './hooks/useProductoForm';
import { useProductoReferenceData } from './hooks/useProductoReferenceData';
import ProductoFormFields from './components/ProductoFormFields';

const ProductoCreate = () => {
  const navigate = useNavigate();
  const { marcas, categorias } = useProductoReferenceData();
  const { formData, errors, setErrors, handleChange, validate } = useProductoForm({
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
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    const newProducto = {
      ...formData,
      precioUnitario: parseFloat(formData.precioUnitario),
      stockDisponible: parseInt(formData.stockDisponible),
      minStock: parseInt(formData.minStock),
    };
    (async () => {
      try {
        await createProducto(newProducto);
        navigate('/productos');
      } catch (err) {
        console.error(err);
        setErrors({ submit: err.message || 'Error al crear producto' });
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-success text-white">
          <h2 className="mb-0"><i className="fas fa-plus me-2"></i>Agregar Nuevo Producto</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <ProductoFormFields
              formData={formData}
              errors={errors}
              onChange={handleChange}
              categorias={categorias}
              marcas={marcas}
            />

            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button type="submit" className="btn btn-primary me-md-2" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>Crear Producto
                  </>
                )}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/productos')}>
                <i className="fas fa-times me-2"></i>Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductoCreate;
