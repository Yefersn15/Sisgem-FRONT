// src/pages/productos/components/ProductoDetalleModal.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../../services/dataService';
import { useCart } from '../../../context/CartContext';

const ProductoDetalleModal = ({ producto, onClose, linkableTags = false, showAdminActions = false, onToggleActivo, onDelete }) => {
  const [cantidad, setCantidad] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    setCantidad(1);
  }, [producto?.id]);

  if (!producto) return null;

  const handleAddToCart = () => {
    addToCart(producto.id, cantidad);
    alert('Producto agregado al carrito');
    onClose();
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title">{producto.nombre}</h3>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-7">
                <div className="mb-4">
                  {linkableTags ? (
                    <>
                      <h5 className="text-muted">
                        <Link to={`/productos/por-categoria/${producto.categoriaId}`} className="text-decoration-none" onClick={(e) => e.stopPropagation()}>
                          <i className="fas fa-tag me-1"></i>{producto.categoriaNombre}
                        </Link>
                      </h5>
                      <div className="mb-3">
                        <Link to={`/productos/por-marca/${producto.marcaId}`} className="badge bg-secondary me-1 text-decoration-none" onClick={(e) => e.stopPropagation()}>
                          <i className="fas fa-industry me-1"></i>{producto.marcaNombre}
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <h5 className="text-muted">{producto.categoriaNombre}</h5>
                      <div className="mb-3">
                        <span className="badge bg-secondary">{producto.marcaNombre}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mb-3">
                  <p><strong>Código de Barras:</strong> <span className="text-muted">{producto.barcode || '-'}</span></p>
                  <p><strong>Precio:</strong> <span className="text-primary h5">{formatPrice(producto.precioUnitario)}</span></p>
                  <p>
                    <strong>Stock:</strong>{' '}
                    <span className={`badge ${producto.stockDisponible > 0 ? 'bg-success' : 'bg-danger'}`}>
                      {producto.stockDisponible} unidades
                    </span>
                  </p>
                  <p>
                    <strong>Estado:</strong>{' '}
                    <span className={`badge ${producto.activo ? 'bg-success' : 'bg-secondary'}`}>
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </p>
                </div>

                <hr />

                <div className="mb-4">
                  <h5>Descripción</h5>
                  <p className="text-justify">{producto.descripcion}</p>
                </div>

                <div className="mt-4 d-flex justify-content-between align-items-center">
                  {showAdminActions && (
                    <div className="d-flex align-items-center gap-1">
                      <Link to={`/productos/editar/${producto.id}`} className="btn btn-outline-primary btn-sm" title="Editar" onClick={onClose}>
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button
                        className={`btn btn-sm ${producto.activo ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        title={producto.activo ? 'Desactivar' : 'Activar'}
                        onClick={() => onToggleActivo(producto.id, producto.activo, producto.nombre)}
                      >
                        <i className={`fas fa-toggle-${producto.activo ? 'on' : 'off'}`}></i>
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        title="Eliminar"
                        onClick={() => onDelete(producto.id, producto.nombre)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  )}
                  {producto.stockDisponible > 0 && (
                    <div className="d-flex align-items-center">
                      <input
                        type="number"
                        className="form-control me-2"
                        style={{ width: '50px' }}
                        min={1}
                        max={producto.stockDisponible}
                        value={cantidad}
                        onChange={(e) => {
                          const v = parseInt(e.target.value || '1', 10);
                          setCantidad(Math.max(1, Math.min(producto.stockDisponible, isNaN(v) ? 1 : v)));
                        }}
                      />
                      <button className="btn btn-primary btn-sm" aria-label="Agregar al carrito" onClick={handleAddToCart}>
                        <i className="fas fa-cart-plus"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-md-5 text-center">
                {producto.fotoUrl ? (
                  <img
                    src={producto.fotoUrl}
                    className="img-fluid rounded shadow mb-3 productImage"
                    alt={producto.nombre}
                    style={{ maxHeight: '300px', width: 'auto', objectFit: 'contain' }}
                  />
                ) : (
                  <div className="text-muted" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-image fa-5x"></i>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalleModal;
