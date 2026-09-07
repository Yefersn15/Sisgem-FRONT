import { useNavigate, useParams } from 'react-router-dom';
import { formatPrice } from '../../services/api/utils';
import { useProductoForm } from './hooks/useProductoForm';
import { useProductoReferenceData } from './hooks/useProductoReferenceData';
import ProductoFormFields from './components/ProductoFormFields';

const ProductoEdit = ({ esDetalle = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { marcas, categorias } = useProductoReferenceData();
  const { formData, errors, handleChange, loading, loadingData, fetchError, handleSubmit, fotoRef } = useProductoForm(id);

  if (fetchError) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{fetchError}</div>
        <button className="btn btn-primary" onClick={() => navigate('/productos')}>Volver</button>
      </div>
    );
  }

  if (loadingData || !formData) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (esDetalle) {
    return (
      <div className="container mt-4">
        <div className="card shadow">
          <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
            <h2 className="mb-0"><i className="fas fa-box me-2"></i>{formData.nombre}</h2>
            <button className="btn btn-light btn-sm" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left me-1"></i>Volver
            </button>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4 text-center mb-4">
                {formData.fotoUrl ? (
                  <img src={formData.fotoUrl} alt={formData.nombre} className="img-fluid rounded" style={{ maxHeight: '300px' }} />
                ) : (
                  <div className="bg-light d-flex align-items-center justify-content-center rounded" style={{ height: '300px' }}>
                    <i className="fas fa-image fa-4x text-muted"></i>
                  </div>
                )}
              </div>
              <div className="col-md-8">
                <h4 className="text-muted">Información del Producto</h4>
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <td className="text-muted fw-bold" style={{ width: '150px' }}>ID:</td>
                      <td>#{formData.id}</td>
                    </tr>
                    <tr>
                      <td className="text-muted fw-bold">Código:</td>
                      <td>{formData.barcode || 'Sin código'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted fw-bold">Descripción:</td>
                      <td>{formData.descripcion}</td>
                    </tr>
                    <tr>
                      <td className="text-muted fw-bold">Categoría:</td>
                      <td>
                        {formData.categoria?.nombre || formData.categoriaNombre || categorias.find(c => c.id == formData.categoriaId)?.nombre || 'Sin categoría'}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted fw-bold">Marca:</td>
                      <td>
                        {formData.marca?.nombre || formData.marcaNombre || marcas.find(m => m.id == formData.marcaId)?.nombre || 'Sin marca'}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted fw-bold">Precio:</td>
                      <td className="fw-bold text-success">{formatPrice(formData.precioUnitario)}</td>
                    </tr>
                    <tr>
                      <td className="text-muted fw-bold">Stock:</td>
                      <td>
                        <span className={`badge ${parseInt(formData.stockDisponible) > 0 ? 'bg-success' : 'bg-danger'}`}>
                          {formData.stockDisponible} unidades
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted fw-bold">Estado:</td>
                      <td>
                        <span className={`badge ${formData.activo !== false ? 'bg-success' : 'bg-secondary'}`}>
                          {formData.activo !== false ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-3">
                  <button className="btn btn-primary" onClick={() => navigate(`/productos/editar/${formData.id}`)}>
                    <i className="fas fa-edit me-2"></i>Editar Producto
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0"><i className="fas fa-edit me-2"></i>Editar Producto: {formData.nombre}</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <ProductoFormFields
              formData={formData}
              errors={errors}
              onChange={handleChange}
              categorias={categorias}
              marcas={marcas}
              fotoRef={fotoRef}
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

export default ProductoEdit;
