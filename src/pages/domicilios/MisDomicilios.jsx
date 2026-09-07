// src/pages/domicilios/MisDomicilios.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../services/api/utils';
import { useMisDomicilios, getBadgeClass } from './hooks/useMisDomicilios';
import FiltrosBar from '../../components/FiltrosBar';
import Pagination from '../../components/Pagination';
import { useAyudaPagina } from '../../hooks/useAyudaPagina';

const MisDomicilios = () => {
  useAyudaPagina({
    titulo: 'Mis Domicilios',
    contenido: <p>Aquí aparecen los envíos de tus pedidos a domicilio: dirección, estado y repartidor asignado. Usa el buscador o el filtro de estado para encontrar uno.</p>,
  });
  const {
    user,
    search,
    setSearch,
    filter,
    setFilter,
    clearFilters,
    paginatedItems,
    currentPage,
    setCurrentPage,
    totalPages,
    getVentaInfo,
  } = useMisDomicilios();

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

          <FiltrosBar onClear={clearFilters}>
            <div className="col-12 col-md-4">
              <input
                className="form-control"
                placeholder="Buscar por ID, dirección o estado..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-6 col-md">
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
          </FiltrosBar>

          {paginatedItems.length === 0 ? (
            <div className="alert alert-info">No se encontraron domicilios.</div>
          ) : (
            <div className="row">
              {paginatedItems.map((domicilio) => {
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

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  );
};

export default MisDomicilios;
