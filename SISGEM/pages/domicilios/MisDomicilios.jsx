// src/pages/domicilios/MisDomicilios.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getDomicilios, getVentas, formatPrice } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';

const MisDomicilios = () => {
  const { user } = useAuth();
  const [domicilios, setDomicilios] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');

  useEffect(() => {
    const cargarDatos = async () => {
      if (user) {
        // Cargar ventas del usuario
        const todasLasVentas = (await getVentas()) || [];
        const ventasDelUsuario = todasLasVentas.filter(v => 
          v.usuarioId === user.id
        );
        setVentas(ventasDelUsuario);
        
        // Obtener IDs de las ventas del usuario
        const ventaIds = ventasDelUsuario.map(v => v.id);
        
        // Filtrar domicilios que pertenecen a las ventas del usuario
        const todosDomicilios = (await getDomicilios()) || [];
        const domiciliosDelUsuario = todosDomicilios.filter(d => 
          ventaIds.includes(d.ventaId) || ventaIds.includes(d.id)
        );
        setDomicilios(domiciliosDelUsuario);
      }
    };
    cargarDatos();
  }, [user]);

  const getBadgeClass = (estado) => {
      const e = String(estado || '').toLowerCase();
      switch (e) {
        case 'entregado': return 'bg-success';
        case 'enviado':
        case 'recibido': return 'bg-primary';
        case 'aprobado': return 'bg-info text-dark';
        case 'pendiente': return 'bg-warning text-dark';
        case 'cancelado':
        case 'anulado': return 'bg-danger';
        default: return 'bg-secondary';
      }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return domicilios.filter(d => {
      if (filter !== 'Todos' && d.estado !== filter) return false;
      if (!q) return true;
      
      const venta = ventas.find(v => String(v.id) === String(d.ventaId) || String(v.id) === String(d.id));
      const fields = [
        d.id, 
        d.direccion, 
        d.estado,
        venta?.id
      ].filter(Boolean).join(' ').toLowerCase();
      return fields.includes(q);
    });
  }, [domicilios, ventas, search, filter]);

  const getVentaInfo = (domicilio) => {
    return ventas.find(v => String(v.id) === String(domicilio.ventaId) || String(v.id) === String(domicilio.id));
  };

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">Debe iniciar sesión para ver sus domicilios.</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-body">
          <h2 className="card-title">Mis Domicilios</h2>

          <div className="row mb-3">
            <div className="col-md-5 mb-2">
              <input
                className="form-control"
                placeholder="Buscar por ID, dirección o estado"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3 mb-2">
              <select 
                className="form-select" 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
              >
                  <option value="Todos">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="enviado">Enviado</option>
                  <option value="recibido">Recibido</option>
                  <option value="entregado">Entregado</option>
                  <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className="col-md-1 mb-2 text-end">
              <button className="btn btn-secondary" onClick={() => { setSearch(''); setFilter('Todos') }}>Limpiar</button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="alert alert-info">No se encontraron domicilios.</div>
          ) : (
            <div className="row">
              {filtered.map((domicilio) => {
                const venta = getVentaInfo(domicilio);
                return (
                  <div className="col-md-6 col-lg-4 mb-3" key={domicilio.id || domicilio.ventaId}>
                    <div className="card h-100">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <span className="fw-bold">Pedido #{domicilio.ventaId || domicilio.id}</span>
                          <span className={`badge ${getBadgeClass(domicilio.estado)}`}>
                            {String(domicilio.estado || '').charAt(0).toUpperCase() + String(domicilio.estado || '').slice(1)}
                        </span>
                      </div>
                      <div className="card-body">
                        <p className="mb-1">
                          <i className="fas fa-map-marker-alt me-1"></i>
                          <strong>Dirección:</strong> {domicilio.direccion}
                        </p>
                        {domicilio.direccion2 && (
                          <p className="mb-1 text-muted small">{domicilio.direccion2}</p>
                        )}
                        {domicilio.barrio && (
                          <p className="mb-1">
                            <strong>Barrio:</strong> {domicilio.barrio}
                          </p>
                        )}
                        {domicilio.tarifa > 0 && (
                          <p className="mb-1">
                            <strong>Costo envío:</strong> {formatPrice(domicilio.tarifa)}
                          </p>
                        )}
                        {domicilio.repartidor && (
                          <p className="mb-1">
                            <i className="fas fa-user me-1"></i>
                            <strong>Repartidor:</strong> {domicilio.repartidor.nombre || domicilio.repartidor}
                            {domicilio.repartidor.telefono && ` - ${domicilio.repartidor.telefono}`}
                          </p>
                        )}
                      </div>
                      {venta && (
                        <div className="card-footer bg-transparent">
                          <Link to={`/ventas/${venta.id}`} className="btn btn-sm btn-primary">
                            Ver Pedido
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MisDomicilios;