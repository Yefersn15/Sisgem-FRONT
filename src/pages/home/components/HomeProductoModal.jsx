// src/pages/home/components/HomeProductoModal.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../../services/api/utils';
import Modal from '../../../shared/components/common/Modal';

const HomeProductoModal = ({ producto, onClose, onAdd }) => {
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    setCantidad(1);
  }, [producto?.id]);

  if (!producto) return null;
  const stock = producto.stockDisponible || producto.stock || 0;

  return (
    <Modal title={producto.nombre} onClose={onClose} maxWidth={860}>
      <div className="row">
              <div className="col-md-7">
                <div className="mb-4">
                  <h5 className="text-muted">
                    <Link to={`/productos/por-categoria/${producto.categoriaId}`} className="text-decoration-none" onClick={(e) => e.stopPropagation()}>
                      <i className="fas fa-tag me-1"></i>{producto.categoriaNombre || 'Categoría'}
                    </Link>
                  </h5>
                  <div className="mb-3">
                    <Link to={`/productos/por-marca/${producto.marcaId}`} className="badge bg-secondary me-1 text-decoration-none" onClick={(e) => e.stopPropagation()}>
                      <i className="fas fa-industry me-1"></i>{producto.marcaNombre || 'Marca'}
                    </Link>
                  </div>
                </div>

                <div className="mb-3">
                  <p><strong>Código de Barras:</strong> <span className="text-muted">{producto.barcode || '-'}</span></p>
                  <p><strong>Precio:</strong> <span className="text-primary h5">{formatPrice(producto.precioUnitario || producto.precio || 0)}</span></p>
                  <p>
                    <strong>Stock:</strong>{' '}
                    <span className={`badge ${stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                      {stock} unidades
                    </span>
                  </p>
                </div>

                <hr />

                <div className="mb-4">
                  <h5>Descripción</h5>
                  <p className="text-justify">{producto.descripcion}</p>
                </div>

                {stock > 0 && (
                  <div className="d-flex align-items-center justify-content-end">
                    <input
                      type="number"
                      className="form-control me-2"
                      style={{ width: '60px' }}
                      min={1}
                      max={stock || 1}
                      value={cantidad}
                      onChange={(e) => {
                        const v = parseInt(e.target.value || '1', 10);
                        setCantidad(Math.max(1, Math.min(stock || 1, isNaN(v) ? 1 : v)));
                      }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => onAdd(producto, cantidad)}
                      title="Agregar al carrito"
                    >
                      <i className="fas fa-cart-plus"></i>
                    </button>
                  </div>
                )}
              </div>

              <div className="col-md-5 text-center">
                {producto.fotoUrl ? (
                  <img
                    src={producto.fotoUrl}
                    className="img-fluid rounded shadow mb-3"
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
    </Modal>
  );
};

export default HomeProductoModal;
