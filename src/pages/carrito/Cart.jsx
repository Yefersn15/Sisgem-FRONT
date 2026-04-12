import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../services/dataService';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItemsWithDetails, removeFromCart, updateCartItem, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (productoId, newCantidad, stock) => {
    if (newCantidad < 1) newCantidad = 1;
    if (newCantidad > stock) {
      alert(`La cantidad no puede ser mayor al stock disponible (${stock}).`);
      newCantidad = stock;
    }
    updateCartItem(productoId, newCantidad);
  };

  const handleRemove = (productoId) => {
    if (window.confirm('¿Eliminar este producto del carrito?')) {
      removeFromCart(productoId);
    }
  };

  const subtotal = cartItemsWithDetails.reduce(
    (sum, item) => {
      const producto = item.producto || {};
      const precio = producto.precio || producto.precioUnitario || 0;
      console.log('Item:', item, 'Producto:', producto, 'Precio:', precio);
      return sum + precio * (item.cantidad || 0);
    },
    0
  );

  const formatCurrency = (value) => formatPrice(value);

  if (cartItemsWithDetails.length === 0) {
    return (
      <div className="container mt-4">
        <div className="alert alert-info text-center">
          <i className="fas fa-shopping-cart fa-3x mb-3"></i>
          <h4>El carrito está vacío</h4>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/productos')}>
            Ver productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-light">
              <h4>Carrito de compras</h4>
            </div>
            <div className="card-body">
              {cartItemsWithDetails
                .filter(item => item.producto && (item.producto.id || item.producto._id))
                .map((item) => {
                  const producto = item.producto;
                  const cantidad = item.cantidad;
                  const productId = producto.id || producto._id;

                  return (
                    <div key={productId}>
                      <div className="d-flex align-items-center mb-3">
                        <img
                          src={producto.imagen || 'https://via.placeholder.com/100'}
                          className="img-thumbnail me-3"
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          alt={producto.nombre}
                        />
                        <div className="flex-grow-1">
                          <h5>{producto.nombre}</h5>
                          <p className="mb-1">{producto.descripcion}</p>
                          <p className="mb-1"><strong>Precio:</strong> {formatCurrency(producto.precio)}</p>

                          <div className="d-inline-block me-2">
                            <input
                              type="number"
                              className="form-control quantity-input d-inline-block"
                              style={{ width: '80px' }}
                              min="1"
                              max={producto.stock}
                              value={cantidad}
                              onChange={(e) =>
                                handleQuantityChange(productId, parseInt(e.target.value) || 1, producto.stock)
                              }
                            />
                          </div>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemove(productId)}
                          >
                            Eliminar
                          </button>
                        </div>
                        <div className="text-end" style={{ width: '150px' }}>
                          <p className="mb-0">Subtotal</p>
                          <h5 className="mb-0">{formatCurrency(producto.precio * cantidad)}</h5>
                        </div>
                      </div>
                      <hr />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5>Resumen</h5>
              <p>Productos: <span>{cartItemsWithDetails.length}</span></p>
              <p>Total: <span>{formatCurrency(subtotal)}</span></p>

              <button
                className="btn btn-primary w-100 mb-2"
                onClick={() => navigate('/checkout')}
              >
                Proceder al pago
              </button>
              <button className="btn btn-outline-secondary w-100" onClick={clearCart}>
                Vaciar carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;