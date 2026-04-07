// src/pages/ordenes/OrdenCreate.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createOrdenCompra, getProveedores, getProviderCartItemsWithDetails, clearProviderCart, getMarcas, getCategorias } from '../../services/dataService';
import { useCart } from '../../context/CartContext';

const fmtCOP = (n) => `COP$ ${(n || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;

const OrdenCreate = () => {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState([]);
  const { addToProviderCart, getProviderCartItemsWithDetails: getCartDetailsFromContext, clearProviderCart: clearCartContext } = useCart();
  
  // Estado para usar sistema de carrito
  const [selectedProveedorId, setSelectedProveedorId] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [notas, setNotas] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Cargar items del carrito cuando cambia el proveedor
  useEffect(() => {
    if (selectedProveedorId) {
      try {
        const items = getCartDetailsFromContext ? getCartDetailsFromContext(selectedProveedorId) : getProviderCartItemsWithDetails(selectedProveedorId);
        setCartItems(items.map(item => ({ ...item })));
      } catch (e) {
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  }, [selectedProveedorId]);

  useEffect(() => {
    (async () => {
      const provs = await getProveedores() || [];
      setProveedores(provs.filter(p => p.estado === true));
    })();
  }, []);

  const handleProveedorChange = (e) => {
    setSelectedProveedorId(e.target.value);
    setErrors({});
  };

  const updateCantidad = (idx, value) => {
    setCartItems(prev => prev.map((item, i) => 
      i === idx ? { ...item, cantidad: parseInt(value) || 0 } : item
    ));
  };

  const removeItem = (idx) => {
    setCartItems(prev => prev.filter((_, i) => i !== idx));
  };

  const total = cartItems.reduce((sum, item) => {
    const precio = item.source === 'producto' ? (item.producto?.precioUnitario || 0) : (item.catalogItem?.precioSugerido || 0);
    return sum + (precio * (item.cantidad || 0));
  }, 0);

  const handleCreateAndSend = () => {
    const proveedor = proveedores.find(p => String(p.id) === String(selectedProveedorId));
    
    if (!proveedor) {
      setErrors({ proveedor: 'Selecciona un proveedor' });
      return;
    }
    if (cartItems.length === 0) {
      setErrors({ items: 'No hay productos en el carrito' });
      return;
    }

    // Construir items para createOrdenCompra
    const ordenItems = cartItems.map(item => {
      if (item.source === 'producto') {
        return { productoId: item.producto.id, nombre: item.producto.nombre, cantidad: item.cantidad, precioUnitario: item.producto.precioUnitario };
      }
      return { productoId: '', nombre: item.catalogItem.nombre, cantidad: item.cantidad, precioUnitario: item.catalogItem.precioSugerido };
    });

    const orden = createOrdenCompra({ 
      proveedorId: selectedProveedorId, 
      proveedor: proveedor.nombre,
      items: ordenItems, 
      notas 
    });

    // Limpiar carrito del proveedor
    try {
      if (clearCartContext) clearCartContext(selectedProveedorId);
      else clearProviderCart(selectedProveedorId);
    } catch (e) { /* ignore */ }

    // Preparar mensaje de WhatsApp
    const phoneRaw = ((proveedor.telefonoPais || '') + (proveedor.telefono || '')).replace(/\D/g, '');
    
    if (phoneRaw) {
      let msg = `Orden de Compra - ${proveedor.nombre || ''}\n`;
      msg += `ID orden: ${orden.id}\n\n`;
      msg += `Items:\n`;
      orden.items.forEach(it => {
        msg += `- ${it.cantidad} x ${it.nombre} @ ${Number(it.precioUnitario).toFixed(2)}\n`;
      });
      msg += `\nTotal: $${Number(orden.total).toFixed(2)}\n`;
      if (notas) msg += `Notas: ${notas}\n`;

      const waUrl = `https://wa.me/${phoneRaw}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
    }

    setSuccess(true);
    setTimeout(() => navigate(`/ordenes/${orden.id}`), 1500);
  };

  if (success) {
    return (
      <div className="container my-4 text-center">
        <div className="alert alert-success">
          <i className="fas fa-check-circle fa-3x mb-3"></i>
          <h4>Orden registrada exitosamente</h4>
          <p>Redirigiendo al detalle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-outline-secondary" onClick={() => navigate('/ordenes')}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div>
          <h2>Nueva Orden de Compra</h2>
          <p className="text-muted mb-0">Selecciona un proveedor para ver los productos en carrito</p>
        </div>
      </div>

      {/* Selección de proveedor */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Seleccionar Proveedor</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-8 mb-3">
              <label className="form-label">Proveedor *</label>
              <select 
                className={`form-select ${errors.proveedor ? 'is-invalid' : ''}`}
                value={selectedProveedorId}
                onChange={handleProveedorChange}
              >
                <option value="">-- Seleccionar proveedor activo --</option>
                {proveedores.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
              {errors.proveedor && <div className="invalid-feedback">{errors.proveedor}</div>}
            </div>
            <div className="col-md-4 mb-3 d-flex align-items-end">
              <Link to="/proveedores/nuevo" className="btn btn-outline-primary">
                <i className="fas fa-plus me-1"></i>Nuevo Proveedor
              </Link>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Notas / Observaciones</label>
            <textarea 
              className="form-control" 
              rows="2"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Instrucciones de entrega, condiciones especiales..."
            />
          </div>
        </div>
      </div>

      {/* Items del carrito */}
      {selectedProveedorId && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Productos del Carrito</h5>
            <span className="badge bg-secondary">{cartItems.length} items</span>
          </div>
          <div className="card-body">
            {errors.items && <div className="alert alert-danger">{errors.items}</div>}

            {cartItems.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="fas fa-shopping-cart fa-3x mb-3"></i>
                <p>No hay productos en el carrito de este proveedor</p>
                <Link to="/productos" className="btn btn-primary">
                  <i className="fas fa-plus me-1"></i>Agregar Productos
                </Link>
              </div>
            ) : (
              <>
                {/* Encabezados */}
                <div className="row g-2 mb-2 fw-bold text-muted small">
                  <div className="col-md-5">Producto</div>
                  <div className="col-md-2">Cantidad</div>
                  <div className="col-md-2">P. Unitario</div>
                  <div className="col-md-2">Subtotal</div>
                  <div className="col-md-1"></div>
                </div>

                {cartItems.map((item, i) => {
                  const precio = item.source === 'producto' ? (item.producto?.precioUnitario || 0) : (item.catalogItem?.precioSugerido || 0);
                  const nombre = item.source === 'producto' ? (item.producto?.nombre || 'Sin nombre') : (item.catalogItem?.nombre || 'Sin nombre');
                  const subtotal = precio * (item.cantidad || 0);
                  
                  return (
                    <div key={i} className="row g-2 mb-2 align-items-center">
                      <div className="col-md-5">
                        <span className="fw-medium">{nombre}</span>
                        <br/>
                        <small className="text-muted">{item.source === 'producto' ? 'Producto propio' : 'Catálogo'}</small>
                      </div>
                      <div className="col-md-2">
                        <input 
                          type="number" 
                          className="form-control" 
                          min="1"
                          value={item.cantidad} 
                          onChange={(e) => updateCantidad(i, e.target.value)}
                        />
                      </div>
                      <div className="col-md-2 fw-bold text-primary">
                        {fmtCOP(precio)}
                      </div>
                      <div className="col-md-2 fw-bold">
                        {fmtCOP(subtotal)}
                      </div>
                      <div className="col-md-1">
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeItem(i)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Total */}
                <div className="row mt-3">
                  <div className="col-md-10 text-end fw-bold">Total Orden:</div>
                  <div className="col-md-2 text-end fw-bold text-primary h4">{fmtCOP(total)}</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {selectedProveedorId && cartItems.length > 0 && (
        <div className="d-flex justify-content-between">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/ordenes')}>Cancelar</button>
          <button type="button" className="btn btn-primary" onClick={handleCreateAndSend}>
            <i className="fab fa-whatsapp me-1"></i>Crear y Enviar por WhatsApp
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdenCreate;