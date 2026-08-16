// src/pages/domicilios/components/DomicilioCard.jsx
import React from 'react';
import { formatPrice } from '../../../services/dataService';
import { isEstadoFinalDomicilio } from '../hooks/domicilioEstados';

const DomicilioCard = ({ dom, onCambiarEstado, onEditarTarifa, onAsignarRepartidor, onImprimir, onWhatsapp, onNotas, onConvertirAVenta }) => {
  const estadoNorm = String(dom.estado || 'pendiente').toLowerCase();
  const badgeColor = estadoNorm === 'entregado' ? 'success'
    : estadoNorm === 'en_camino' || estadoNorm === 'asignado' || estadoNorm === 'en_preparacion' || estadoNorm === 'aprobado' ? 'warning'
    : estadoNorm === 'cancelado' ? 'danger' : 'secondary';

  return (
    <div className="card domicilioCard">
      <div className="card-body">
        <h5 className="card-title">Venta #{dom.pedidoId || dom.venta?.id || 'N/A'}</h5>
        {dom.venta?.usuarioNombre && (
          <p className="mb-1"><i className="fas fa-user me-2"></i>{dom.venta.usuarioNombre}</p>
        )}
        <p className="mb-1"><i className="fas fa-map-marker-alt me-2"></i>{dom.direccion || dom.venta?.direccion}{dom.barrio ? ` (${dom.barrio})` : ''}{dom.tipo ? ` [${dom.tipo.charAt(0).toUpperCase() + dom.tipo.slice(1)}]` : ''}</p>
        <p className="mb-1"><i className="fas fa-phone me-2"></i>{dom.telefono || dom.venta?.telefono || dom.venta?.telefonoContacto || 'Sin teléfono'}</p>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <span className={`badge bg-${badgeColor}`}>{dom.estado || dom.venta?.estadoPedido || 'Pendiente'}</span>
          <div className="d-flex align-items-center gap-2">
            {dom.estado !== 'entregado' && (
              <button className="btn btn-sm btn-outline-warning py-0 px-1" onClick={() => onEditarTarifa(dom.pedidoId, dom.tarifa)} title="Editar tarifa">
                <i className="fas fa-dollar-sign"></i>
              </button>
            )}
            <span className="fw-bold">{formatPrice((dom.tarifaAplicada ?? dom.tarifa_aplicada) ?? dom.tarifa ?? 0)}</span>
          </div>
        </div>
        {dom.repartidor ? (
          <div className="mt-2 p-2 repartidorInfo">
            <div>
              <i className="fas fa-motorcycle me-1"></i>
              <strong>{typeof dom.repartidor === 'object' ? (dom.repartidor.nombre ? String(dom.repartidor.nombre).split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '') : String(dom.repartidor)}</strong>
            </div>
            {typeof dom.repartidor === 'object' && dom.repartidor.tipoVehiculo && (
              <div><span className="badge bg-secondary me-1">{dom.repartidor.tipoVehiculo}</span></div>
            )}
            {typeof dom.repartidor === 'object' && dom.repartidor.placa && (
              <div><span className="badge bg-primary me-1">Placa: {dom.repartidor.placa}</span></div>
            )}
            {typeof dom.repartidor === 'object' && dom.repartidor.telefono && (
              <div><span className="text-muted">📞 {dom.repartidor.telefono}</span></div>
            )}
          </div>
        ) : (
          <div className="mt-2 text-muted">
            <small>Sin repartidor asignado</small>
          </div>
        )}
        <div className="mt-3">
          {isEstadoFinalDomicilio(dom.estado) ? (
            <span className={`badge ${dom.estado === 'entregado' ? 'bg-success' : 'bg-danger'} mb-2`}>
              Domicilio: {String(dom.estado || '').charAt(0).toUpperCase() + String(dom.estado || '').slice(1)}
            </span>
          ) : (
            <select
              className="form-select form-select-sm mb-2"
              value={dom.estado}
              onChange={(e) => onCambiarEstado(dom.pedidoId, e.target.value)}
            >
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="asignado">Asignado</option>
              <option value="en_camino">En camino</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          )}
        </div>
        <div className="mt-2 d-flex gap-2">
          {dom.estado !== 'entregado' && (
            <button className="btn btn-sm btn-outline-primary" onClick={() => onAsignarRepartidor(dom.pedidoId)}>
              <i className="fas fa-user-plus me-1"></i>{dom.repartidor ? 'Editar' : 'Asignar'} Repartidor
            </button>
          )}
          <button className="btn btn-sm btn-outline-secondary" onClick={() => onImprimir(dom)}>
            <i className="fas fa-print"></i>
          </button>
          <button className="btn btn-sm btn-outline-success" onClick={() => onWhatsapp(dom)}>
            <i className="fab fa-whatsapp"></i>
          </button>
          <button className="btn btn-sm btn-outline-info" onClick={() => onNotas(dom.pedidoId, dom.notas)}>
            <i className="fas fa-sticky-note"></i>
          </button>
          {dom.estado === 'entregado' && dom.venta?.esVenta === false && (
            <button className="btn btn-sm btn-outline-success" onClick={() => onConvertirAVenta(dom.pedidoId)} title="Convertir a venta">
              <i className="fas fa-check-circle"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DomicilioCard;
