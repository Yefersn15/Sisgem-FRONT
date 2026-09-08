// src/pages/domicilios/MisEntregas.jsx
import React from 'react';
import { formatPrice } from '../../services/api/utils';
import { useMisEntregas, getBadgeClass } from './hooks/useMisEntregas';
import FiltrosBar from '../../components/FiltrosBar';
import Pagination from '../../components/Pagination';
import { useAyudaPagina } from '../../hooks/useAyudaPagina';

const ETIQUETAS_ESTADO = {
  en_camino: 'En camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const etiquetaEstado = (estado) => {
  const key = String(estado || '').toLowerCase();
  return ETIQUETAS_ESTADO[key] || estado;
};

const MisEntregas = () => {
  useAyudaPagina({
    titulo: 'Mis Entregas',
    contenido: <p>Aquí aparecen los domicilios que tienes asignados para entregar. Usa los botones de cada tarjeta para avanzar su estado a medida que recoges y entregas el pedido.</p>,
  });
  const {
    user,
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    clearFilters,
    paginatedItems,
    currentPage,
    setCurrentPage,
    totalPages,
    cambiarEstado,
    actualizandoId,
    error,
    getSiguientesEstados,
  } = useMisEntregas();

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">Debe iniciar sesión para ver sus entregas.</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-body">
          <h2 className="card-title">Mis Entregas</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <FiltrosBar onClear={clearFilters}>
            <div className="col-12 col-md-4">
              <input
                className="form-control"
                placeholder="Buscar por ID, dirección, barrio o cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-6 col-md">
              <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="activas">Activas</option>
                <option value="finalizadas">Finalizadas</option>
                <option value="todas">Todas</option>
              </select>
            </div>
          </FiltrosBar>

          {loading ? (
            <div className="text-center text-muted py-4">Cargando...</div>
          ) : paginatedItems.length === 0 ? (
            <div className="alert alert-info text-center">
              <i className="fas fa-truck fa-2x mb-2 d-block"></i>
              No tienes entregas asignadas por el momento.
            </div>
          ) : (
            <div className="row">
              {paginatedItems.map((entrega) => {
                const siguientes = getSiguientesEstados(entrega.estado);
                const enProceso = actualizandoId === entrega.id;
                return (
                  <div className="col-md-6 col-lg-4 mb-3" key={entrega.id}>
                    <div className="card h-100">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <span className="fw-bold">Pedido #{entrega.ventaId || entrega.id}</span>
                        <span className={`badge ${getBadgeClass(entrega.estado)}`}>{etiquetaEstado(entrega.estado)}</span>
                      </div>
                      <div className="card-body">
                        <p className="mb-1">
                          <i className="fas fa-map-marker-alt me-1"></i>
                          <strong>Dirección:</strong> {entrega.direccion}
                        </p>
                        {entrega.direccion2 && <p className="mb-1 text-muted small">{entrega.direccion2}</p>}
                        {entrega.barrio && (
                          <p className="mb-1">
                            <strong>Barrio:</strong> {entrega.barrio}{entrega.ciudad ? `, ${entrega.ciudad}` : ''}
                          </p>
                        )}
                        {entrega.clienteNombre && (
                          <p className="mb-1">
                            <i className="fas fa-user me-1"></i>
                            <strong>Cliente:</strong> {entrega.clienteNombre}
                          </p>
                        )}
                        {entrega.telefono && (
                          <p className="mb-1">
                            <i className="fas fa-phone me-1"></i>
                            <a href={`tel:${entrega.telefono}`}>{entrega.telefono}</a>
                          </p>
                        )}
                        <p className="mb-1">
                          <strong>Total del pedido:</strong> {formatPrice(entrega.total)}
                        </p>
                        {entrega.tarifa > 0 && (
                          <p className="mb-1">
                            <strong>Costo envío:</strong> {formatPrice(entrega.tarifa)}
                          </p>
                        )}
                        {entrega.metodoPago && (
                          <p className="mb-0">
                            <strong>Método de pago:</strong> {entrega.metodoPago}
                          </p>
                        )}
                      </div>
                      {siguientes.length > 0 && (
                        <div className="card-footer bg-transparent d-flex gap-2 flex-wrap">
                          {siguientes.map((estado) => (
                            <button
                              key={estado}
                              className={`btn btn-sm ${estado === 'cancelado' ? 'btn-outline-danger' : 'btn-primary'}`}
                              disabled={enProceso}
                              onClick={() => {
                                if (estado === 'cancelado' && !window.confirm('¿Cancelar esta entrega?')) return;
                                cambiarEstado(entrega.id, estado);
                              }}
                            >
                              {enProceso ? 'Guardando...' : `Marcar ${etiquetaEstado(estado)}`}
                            </button>
                          ))}
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

export default MisEntregas;
