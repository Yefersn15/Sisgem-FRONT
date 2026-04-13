import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductoById, updateProducto, getMarcas, getCategorias, getProveedores, formatPrice } from '../../services/dataService';

const ProductoEdit = ({ esDetalle = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const init = async () => {
      const producto = await getProductoById(id);
      if (!producto) {
        setFetchError('Producto no encontrado');
        return;
      }
      setFormData(producto);
      setMarcas(await getMarcas() || []);
      setCategorias(await getCategorias() || []);
      setProveedores(await getProveedores() || []);
    };
    init();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    else if (formData.nombre.length > 200) newErrors.nombre = 'Máximo 200 caracteres';
    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es obligatoria';
    else if (formData.descripcion.length > 1000) newErrors.descripcion = 'Máximo 1000 caracteres';
    if (!formData.precioUnitario) newErrors.precioUnitario = 'El precio es obligatorio';
    else if (parseFloat(formData.precioUnitario) <= 0) newErrors.precioUnitario = 'Debe ser mayor a 0';
    if (!formData.stockDisponible && formData.stockDisponible !== 0) newErrors.stockDisponible = 'El stock es obligatorio';
    else if (parseInt(formData.stockDisponible) < 0) newErrors.stockDisponible = 'No puede ser negativo';
    if (!formData.categoriaId) newErrors.categoriaId = 'Selecciona una categoría';
    if (!formData.marcaId) newErrors.marcaId = 'Selecciona una marca';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    (async () => {
      try {
        await updateProducto(id, {
          ...formData,
          precioUnitario: parseFloat(formData.precioUnitario),
          stockDisponible: parseInt(formData.stockDisponible)
        });
        navigate('/productos');
      } catch (err) {
        console.error(err);
        setErrors({ submit: err.message || 'Error al actualizar' });
      } finally {
        setLoading(false);
      }
    })();
  };

  if (fetchError) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{fetchError}</div>
        <button className="btn btn-primary" onClick={() => navigate('/productos')}>Volver</button>
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
                      <td>{categorias.find(c => String(c.id) === String(formData.categoriaId))?.nombre || 'Sin categoría'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted fw-bold">Marca:</td>
                      <td>{marcas.find(m => String(m.id) === String(formData.marcaId))?.nombre || 'Sin marca'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted fw-bold">Proveedor:</td>
                      <td>{proveedores.find(p => String(p.id) === String(formData.proveedorId))?.nombre || 'Sin proveedor'}</td>
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
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Nombre del Producto *</label>
                <input
                  type="text"
                  className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                />
                {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Código de Barras</label>
                <input
                  type="text"
                  className={`form-control ${errors.barcode ? 'is-invalid' : ''}`}
                  name="barcode"
                  value={formData.barcode || ''}
                  onChange={handleChange}
                  onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                />
                {errors.barcode && <div className="invalid-feedback">{errors.barcode}</div>}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Descripción *</label>
              <textarea
                className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                name="descripcion"
                rows="3"
                value={formData.descripcion}
                onChange={handleChange}
              ></textarea>
              {errors.descripcion && <div className="invalid-feedback">{errors.descripcion}</div>}
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Categoría *</label>
                <select
                  className={`form-select ${errors.categoriaId ? 'is-invalid' : ''}`}
                  name="categoriaId"
                  value={formData.categoriaId}
                  onChange={handleChange}
                >
                  <option value="">-- Seleccione Categoría --</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
                {errors.categoriaId && <div className="invalid-feedback">{errors.categoriaId}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Marca *</label>
                <select
                  className={`form-select ${errors.marcaId ? 'is-invalid' : ''}`}
                  name="marcaId"
                  value={formData.marcaId}
                  onChange={handleChange}
                >
                  <option value="">-- Seleccione Marca --</option>
                  {marcas.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
                {errors.marcaId && <div className="invalid-feedback">{errors.marcaId}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Proveedor</label>
                <select
                  className="form-select"
                  name="proveedorId"
                  value={formData.proveedorId || ''}
                  onChange={handleChange}
                >
                  <option value="">-- Seleccione Proveedor (opcional) --</option>
                  {proveedores.filter(p => p.estado !== false).map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} ({p.tipo_documento} {p.documento})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Precio Unitario *</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className={`form-control ${errors.precioUnitario ? 'is-invalid' : ''}`}
                    name="precioUnitario"
                    value={formData.precioUnitario}
                    onChange={handleChange}
                  />
                </div>
                {errors.precioUnitario && <div className="invalid-feedback">{errors.precioUnitario}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Stock Disponible *</label>
                <input
                  type="number"
                  min="0"
                  className={`form-control ${errors.stockDisponible ? 'is-invalid' : ''}`}
                  name="stockDisponible"
                  value={formData.stockDisponible}
                  onChange={handleChange}
                />
                {errors.stockDisponible && <div className="invalid-feedback">{errors.stockDisponible}</div>}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">URL de la Imagen</label>
              <input
                type="url"
                className="form-control"
                name="fotoUrl"
                value={formData.fotoUrl || ''}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                />
                <label className="form-check-label">Producto activo</label>
              </div>
            </div>

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