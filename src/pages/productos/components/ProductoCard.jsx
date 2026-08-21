// src/pages/productos/components/ProductoCard.jsx
import React from 'react';
import { formatPrice } from '../../../services/api/utils';

const ProductoCard = ({ producto, onClick, metaLabel, metaIcon }) => (
  <div className="col">
    <div
      className="card h-100 shadow-sm producto-card productCard"
      style={{ cursor: 'pointer' }}
      onClick={onClick}
    >
      <div className="position-relative">
        {producto.fotoUrl ? (
          <img
            src={producto.fotoUrl}
            className="card-img-top productImage"
            alt={producto.nombre}
            style={{ height: '250px', objectFit: 'contain' }}
          />
        ) : (
          <div className="card-img-top d-flex align-items-center justify-content-center bg-light" style={{ height: '250px' }}>
            <i className="fas fa-image fa-3x text-muted"></i>
          </div>
        )}
        <span className={`badge position-absolute top-0 end-0 m-2 ${producto.stockDisponible > 0 ? 'bg-success' : 'bg-danger'}`}>
          {producto.stockDisponible > 0 ? `Stock: ${producto.stockDisponible}` : 'Agotado'}
        </span>
      </div>
      <div className="card-body">
        <h5 className="card-title">{producto.nombre}</h5>
        <p className="card-text text-muted small">{producto.descripcion}</p>
        <div className="d-flex justify-content-between align-items-center">
          <strong className="text-primary">{formatPrice(producto.precioUnitario)}</strong>
          <div className="text-muted small">
            <i className={`fas ${metaIcon} me-1`}></i>{metaLabel}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProductoCard;
