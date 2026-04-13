import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getMarcaById, getProductos } from '../../services/dataService';
import { formatPrice } from '../../services/dataService';

const MarcaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [marca, setMarca] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      const marcaData = await getMarcaById(id);
      if (!marcaData) {
        navigate('/admin/marcas');
        return;
      }
      setMarca(marcaData);

      const todosProductos = await getProductos() || [];
      const productosMarca = todosProductos.filter(p => 
        String(p.marcaId) === String(id) || String(p.marca?.id) === String(id)
      );
      setProductos(productosMarca);
      setLoading(false);
    };
    cargarDatos();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin">Admin</Link></li>
          <li className="breadcrumb-item"><Link to="/admin/marcas">Marcas</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Detalles</li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>{marca.nombre}</h2>
          <p className="text-muted mb-0">Detalles de la marca</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-secondary" onClick={() => navigate('/admin/marcas')}>
            <i className="fas fa-arrow-left me-1"></i>Volver
          </button>
          <button className="btn btn-primary" onClick={() => navigate(`/marcas/editar/${id}`)}>
            <i className="fas fa-edit me-1"></i>Editar
          </button>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Información de la marca</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label small text-muted">Nombre</label>
                <p className="mb-0 fw-medium">{marca.nombre}</p>
              </div>
              
              <div className="mb-3">
                <label className="form-label small text-muted">Descripción</label>
                <p className="mb-0">{marca.descripcion || 'Sin descripción'}</p>
              </div>

              {marca.sitioWeb && (
                <div className="mb-3">
                  <label className="form-label small text-muted">Sitio web</label>
                  <p className="mb-0">
                    <a href={marca.sitioWeb} target="_blank" rel="noopener noreferrer">
                      {marca.sitioWeb}
                    </a>
                  </p>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label small text-muted">Estado</label>
                <p className="mb-0">
                  <span className={`badge ${marca.activa ? 'bg-success' : 'bg-secondary'}`}>
                    {marca.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </p>
              </div>

              <div className="mb-3">
                <label className="form-label small text-muted">Proveedor</label>
                <p className="mb-0">{marca.proveedor?.nombre || 'Sin proveedor asignado'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Productos ({productos.length})</h5>
            </div>
            <div className="card-body p-0">
              {productos.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="fas fa-box fa-2x mb-2"></i>
                  <p className="mb-0">No hay productos asociados</p>
                </div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '400px' }}>
                  <table className="table table-sm mb-0">
                    <thead className="sticky-top">
                      <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.slice(0, 10).map(p => (
                        <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/productos/${p.id}`)}>
                          <td>
                            <div className="d-flex align-items-center">
                              {p.fotoUrl ? (
                                <img 
                                  src={p.fotoUrl} 
                                  alt={p.nombre}
                                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                  className="me-2"
                                />
                              ) : (
                                <div className="bg-light me-2" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                                  <i className="fas fa-image text-muted"></i>
                                </div>
                              )}
                              <span className="text-truncate" style={{ maxWidth: '150px' }}>{p.nombre}</span>
                            </div>
                          </td>
                          <td>{formatPrice(p.precioUnitario || p.precio)}</td>
                          <td>
                            <span className={`badge ${(p.stockDisponible || p.stock || 0) > 0 ? 'bg-success' : 'bg-danger'}`}>
                              {p.stockDisponible || p.stock || 0}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {productos.length > 10 && (
                    <div className="text-center py-2 border-top">
                      <small className="text-muted">Mostrando 10 de {productos.length} productos</small>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarcaDetail;