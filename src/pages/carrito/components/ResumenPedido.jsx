// src/pages/carrito/components/ResumenPedido.jsx
import React from 'react';
import { formatPrice } from '../../../services/dataService';

const ResumenPedido = ({ items, subtotal, total, delivery }) => (
  <div className="card">
    <div className="card-header">Resumen del pedido</div>
    <div className="card-body">
      {items
        .filter(item => item.producto && (item.producto.id || item.producto._id))
        .map(item => {
          const producto = item.producto;
          const productId = producto.id || producto._id;

          return (
            <div key={productId} className="d-flex align-items-center mb-2">
              <img src={producto.imagen || 'https://via.placeholder.com/60'} className="img-thumbnail me-2" style={{ width: '60px', height: '60px', objectFit: 'cover' }} alt={producto.nombre} />
              <div>
                <div className="fw-bold">{producto.nombre}</div>
                <small className="text-muted">{item.cantidad} x {formatPrice(producto.precio)}</small>
              </div>
            </div>
          );
        })}
      <hr />
      <p>Subtotal: <strong>{formatPrice(subtotal)}</strong></p>
      {delivery ? (
        <>
          <p>Envío: <strong className="text-info">Será asignado por la administración</strong></p>
          <h5 className="text-success">Total (envío pendiente): <strong>{formatPrice(total)}</strong></h5>
        </>
      ) : (
        <>
          <p>Envío: <strong>Recoger en tienda</strong></p>
          <h5 className="text-success">Total: <strong>{formatPrice(total)}</strong></h5>
        </>
      )}
    </div>
  </div>
);

export default ResumenPedido;
