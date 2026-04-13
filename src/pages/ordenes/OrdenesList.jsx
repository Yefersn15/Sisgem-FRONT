// src/pages/ordenes/OrdenesList.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getOrdenesCompra, getProveedores, ESTADOS_ORDEN, generarReporteOrdenes } from '../../services/dataService';

const fmtCOP = (n) => `COP$ ${(n || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;

const OrdenesList = () => {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [filterEstado, setFilterEstado] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [reporte, setReporte] = useState(null);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    cargar();
  }, [filterEstado, searchTerm]);

  const cargar = async () => {
    try {
      const list = await getOrdenesCompra();
      const provs = await getProveedores() || [];
      setProveedores(provs);
    
      let filtered = [...list];
    
      if (filterEstado) {
        filtered = filtered.filter(o => o.estado === filterEstado);
      }
    
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        filtered = filtered.filter(o => {
          const prov = provs.find(p => String(p.id) === String(o.proveedorId));
          const provNombre = prov ? prov.nombre.toLowerCase() : '';
          return (
            (o.numeroOrden || '').toLowerCase().includes(q) ||
            provNombre.includes(q) ||
            (o.notas || '').toLowerCase().includes(q)
          );
        });
      }
    
      setOrdenes(filtered);
    } catch (err) {
      console.error('Error cargando órdenes:', err);
    }
  };

  const handleGenerarReporte = () => {
    const r = generarReporteOrdenes(filterEstado);
    setReporte(r);
    setShowReport(true);
  };

  const getProveedorNombre = (proveedorId) => {
    const prov = proveedores.find(p => String(p.id) === String(proveedorId));
    return prov ? prov.nombre : 'Desconocido';
  };

  const getEstadoBadge = (estado) => {
    const colors = {
      'borrador': 'bg-secondary',
      'enviada': 'bg-info',
      'confirmada': 'bg-primary',
      'recibida': 'bg-success',
      'cancelada': 'bg-danger'
    };
    return colors[estado] || 'bg-secondary';
  };

  const totalGeneral = ordenes.filter(o => o.estado !== 'cancelada').reduce((s, o) => s + (parseFloat(o.total) || parseFloat(o.subtotal) || 0), 0);

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Órdenes de Compra</h2>
          <p className="text-muted mb-0">
            {ordenes.length} órdenes · Total: {fmtCOP(totalGeneral)}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={cargar} title="Actualizar">
            <i className="fas fa-sync-alt"></i>
          </button>
          <button className="btn btn-outline-primary" onClick={handleGenerarReporte}>
            <i className="fas fa-chart-bar me-1"></i>Reportes
          </button>
          <Link to="/ordenes/nueva" className="btn btn-primary">
            <i className="fas fa-plus me-1"></i>Nueva Orden
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Buscar por número, proveedor o notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
                <option value="">Todos los estados</option>
                {ESTADOS_ORDEN.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-secondary w-100" onClick={() => { setSearchTerm(''); setFilterEstado(''); }}>
                <i className="fas fa-eraser me-1"></i>Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      {ordenes.length === 0 ? (
        <div className="alert alert-info text-center">No hay órdenes de compra registradas.</div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Proveedor</th>
                  <th>Fecha Creación</th>
                  <th>Fecha Entrega</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((o) => (
                  <tr key={o.id}>
                    <td className="font-monospace fw-bold">{o.numeroOrden}</td>
                    <td>{getProveedorNombre(o.proveedorId)}</td>
                    <td>{new Date(o.fechaCreacion).toLocaleDateString('es-CO')}</td>
                    <td>{o.fechaEntrega || '—'}</td>
                    <td className="font-monospace fw-bold">{fmtCOP(o.total)}</td>
                    <td>
                      <span className={`badge ${getEstadoBadge(o.estado)}`}>
                        {o.estado}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-info" title="Ver" onClick={() => navigate(`/ordenes/${o.id}`)}>
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-primary" title="Editar" onClick={() => navigate(`/ordenes/${o.id}/editar`)}>
                          <i className="fas fa-edit"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Reportes */}
      {showReport && reporte && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reportes de Órdenes de Compra</h5>
                <button type="button" className="btn-close" onClick={() => setShowReport(false)}></button>
              </div>
              <div className="modal-body">
                {/* Resumen por estado */}
                <div className="row g-3 mb-4">
                  {ESTADOS_ORDEN.map(e => (
                    <div key={e} className="col-md-2">
                      <div className="card text-center">
                        <div className="card-body">
                          <h4>{reporte.porEstado[e] || 0}</h4>
                          <span className={`badge ${getEstadoBadge(e)}`}>{e}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Total general */}
                <div className="alert alert-info">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Total General en Compras:</strong> {fmtCOP(reporte.total)}
                      <br />
                      <small>{reporte.cantidad} órdenes vigentes (excluye anuladas)</small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowReport(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdenesList;