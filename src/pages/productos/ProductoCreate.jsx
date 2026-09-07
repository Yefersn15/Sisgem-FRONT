import { useNavigate } from 'react-router-dom';
import { useProductoForm } from './hooks/useProductoForm';
import { useProductoReferenceData } from './hooks/useProductoReferenceData';
import ProductoFormFields from './components/ProductoFormFields';

const ProductoCreate = () => {
  const navigate = useNavigate();
  const { marcas, categorias } = useProductoReferenceData();
  const { formData, errors, handleChange, loading, handleSubmit } = useProductoForm();

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
