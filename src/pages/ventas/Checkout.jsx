import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createPedido, formatPrice, getDirecciones, createDireccion } from '../../services/dataService';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItemsWithDetails, clearCart } = useCart();
  const { user } = useAuth();
  
  const [direcciones, setDirecciones] = useState([]);
  const [selectedDireccionId, setSelectedDireccionId] = useState('');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ direccion: '', barrio: '', telefono: '', tipo: 'casa' });
  
  const [formData, setFormData] = useState({
    direccion: '',
    direccion2: '',
    barrio: '',
    telefono: '',
    countryCode: '57',
    notasDomicilio: '',
    delivery: false,
    metodoPago: 'Abono',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: ''
  });
  const [errors, setErrors] = useState({});

  // Cargar direcciones del usuario
  useEffect(() => {
    const loadDirecciones = async () => {
      if (user && user.documento) {
        try {
          const dirs = await getDirecciones();
          setDirecciones(dirs || []);
          // Seleccionar la opción "Mis datos registrados" por defecto
          if (!selectedDireccionId) {
            setSelectedDireccionId('registered');
            // Inicializar con datos del usuario registrado
            setFormData(prev => ({
              ...prev,
              direccion: user.direccion || '',
              barrio: user.barrio || '',
              telefono: user.telefono || user.celular || ''
            }));
          }
        } catch (err) {
          console.error('Error cargando direcciones:', err);
        }
      }
    };
    loadDirecciones();
  }, [user]);

  // Inicializar teléfono con datos del usuario
  useEffect(() => {
    if (user && !formData.telefono) {
      setFormData(prev => ({
        ...prev,
        telefono: user.telefono || user.celular || ''
      }));
    }
  }, [user]);

  const subtotal = cartItemsWithDetails.reduce(
    (sum, item) => sum + (item.producto.precio || 0) * item.cantidad,
    0
  );
  
  const shipping = 0; // se asigna después por admin
  const total = subtotal;

  // Verificar si hay items en el carrito
  useEffect(() => {
    if (cartItemsWithDetails.length === 0) {
      navigate('/carrito');
    }
  }, [cartItemsWithDetails, navigate]);

  // Redirigir a login si no está logueado
  useEffect(() => {
    if (!user && !loading) {
      navigate('/login?redirect=/checkout');
    }
  }, [user, navigate]);

  const loading = false;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      let newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Limpiar errores de tarjeta cuando se cambia el método de pago (ya no aplica, pero mantenemos por si acaso)
      if (name === 'metodoPago') {
        setErrors(prev => ({
          ...prev,
          cardNumber: '',
          cardExpiry: '',
          cardCvv: '',
          cardName: ''
        }));
      }
      return newData;
    });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDireccionSelect = (e) => {
    const id = e.target.value;
    if (id === 'new') {
      setShowNewAddress(true);
      setSelectedDireccionId('');
      setFormData(prev => ({ ...prev, direccion: '', barrio: '', telefono: '' }));
    } else if (id === 'registered') {
      setShowNewAddress(false);
      setSelectedDireccionId('registered');
      // Cargar datos del usuario registrado
      setFormData(prev => ({
        ...prev,
        direccion: user.direccion || '',
        barrio: user.barrio || '',
        telefono: user.telefono || user.celular || ''
      }));
    } else {
      setShowNewAddress(false);
      setSelectedDireccionId(id);
      const dir = direcciones.find(d => String(d.id) === String(id));
      if (dir) {
        setFormData(prev => ({
          ...prev,
          direccion: dir.direccion,
          barrio: dir.barrio,
          telefono: dir.telefono || prev.telefono
        }));
      }
    }
  };

  const handleAddAddress = async () => {
    try {
      if (newAddress.direccion.trim() && user) {
        // Verificar límite de 3 direcciones
        if (direcciones.length >= 3) {
          alert('Máximo 3 direcciones guardadas. Por favor elimina una para agregar una nueva.');
          return;
        }
        
        const dirData = {
          nombre: `${newAddress.direccion} ${newAddress.barrio || ''}`.trim(),
          direccion: newAddress.direccion,
          barrio: newAddress.barrio,
          telefono: newAddress.telefono || user.telefono || user.celular || '',
          tipo: newAddress.tipo || 'casa',
          es_predeterminada: direcciones.length === 0
        };
        const nuevaDir = await createDireccion(dirData);
        setDirecciones(prev => [...prev, nuevaDir]);
        setSelectedDireccionId(nuevaDir.id);
        setFormData(prev => ({
          ...prev,
          direccion: nuevaDir.direccion,
          barrio: nuevaDir.barrio,
          telefono: nuevaDir.telefono
        }));
        setShowNewAddress(false);
        setNewAddress({ direccion: '', barrio: '', telefono: '', tipo: 'casa' });
      }
    } catch (e) {
      console.error('Error agregando dirección:', e);
      alert('No se pudo guardar la dirección: ' + (e.message || e));
    }
  };

  const validate = () => {
    const newErrors = {};
    const metodo = formData.metodoPago;
    const isDelivery = formData.delivery;
    
    if (isDelivery) {
      if (!formData.direccion?.trim()) newErrors.direccion = 'La dirección es obligatoria';
      if (!formData.telefono?.trim()) newErrors.telefono = 'El teléfono es obligatorio';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const validationErrors = validate();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      const productos = cartItemsWithDetails
        .filter(item => item.producto && (item.producto.id || item.producto._id))
        .map(item => {
          const productoId = item.producto.id || item.producto._id;
          return {
            producto: productoId,
            cantidad: item.cantidad,
            precio_unitario: item.producto.precio
          };
        });

      let estado = formData.delivery ? 'Pendiente' : 'Pendiente';

      const cleanedPhone = (formData.telefono || '').toString().replace(/\D/g, '');
      const prefix = (formData.countryCode || '').toString().replace(/\D/g, '');
      const telefonoCompleto = `${prefix}${cleanedPhone}`;

      const payload = {
        telefono_contacto: telefonoCompleto,
        subtotal,
        shipping,
        total,
        metodo_pago: formData.metodoPago,
        estado,
        productos,
        notasDomicilio: formData.notasDomicilio || '',
        notasAutor: formData.delivery ? 'usuario' : undefined,
        delivery: formData.delivery,
        direccion: formData.delivery ? {
          direccion: formData.direccion,
          direccion2: formData.direccion2 || '',
          barrio: formData.barrio,
          telefono: telefonoCompleto
        } : null,
        tipo_venta: formData.delivery ? 'domicilio' : 'mostrador'
      };

      const pedidoCreado = await createPedido(payload);
      if (!pedidoCreado || !pedidoCreado.id) {
        throw new Error('No se pudo crear el pedido correctamente');
      }
      clearCart();
      navigate(`/pedidos/${pedidoCreado.id}`);
    } catch (error) {
      console.error('Error al crear la venta:', error);
      alert('Error al procesar el pedido: ' + error.message);
    }
  };

  if (cartItemsWithDetails.length === 0) {
    return <div className="container mt-4">Redirigiendo...</div>;
  }

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="fas fa-user-lock fa-3x text-muted mb-3"></i>
            <h4>Debes iniciar sesión</h4>
            <p className="text-muted">Para continuar con el checkout, necesitas tener una cuenta e iniciar sesión.</p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/login?redirect=/checkout" className="btn btn-primary">
                <i className="fas fa-sign-in-alt me-2"></i>Iniciar Sesión
              </Link>
              <Link to="/register?redirect=/checkout" className="btn btn-outline-primary">
                <i className="fas fa-user-plus me-2"></i>Registrarse
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-3">
            <div className="card-header">
              <h5 className="mb-0"><i className="fas fa-shopping-cart me-2"></i>Confirmar Pedido</h5>
            </div>
            <div className="card-body">
              <div className="alert alert-info mb-4">
                <i className="fas fa-user me-2"></i>
                Comprando como: <strong>{user.nombre} {user.apellido}</strong> ({user.email})
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="delivery"
                    name="delivery"
                    checked={formData.delivery}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="delivery">
                    Solicitar Domicilio
                  </label>
                </div>

                {formData.delivery && (
                  <>
                    <div className="mb-3">
                      <label htmlFor="savedAddress" className="form-label">Dirección de entrega</label>
                      <select
                        className="form-select"
                        id="savedAddress"
                        value={selectedDireccionId}
                        onChange={handleDireccionSelect}
                      >
                        <option value="registered">Mis datos registrados</option>
                        {direcciones.map(addr => (
                          <option key={addr.id} value={addr.id}>
                            {addr.direccion} {addr.barrio ? `- ${addr.barrio}` : ''} {addr.tipo ? `(${addr.tipo})` : ''} {addr.es_predeterminada ? '(Principal)' : ''}
                          </option>
                        ))}
                        {direcciones.length < 3 && <option value="new">+ Agregar nueva dirección</option>}
                      </select>
                    </div>

                    {showNewAddress && (
                      <div className="card bg-light mb-3 p-3">
                        <h6 className="mb-3">Nueva Dirección</h6>
                        <div className="mb-2">
                          <label className="form-label">Tipo de residencia *</label>
                          <select
                            className="form-select"
                            value={newAddress.tipo}
                            onChange={e => setNewAddress({...newAddress, tipo: e.target.value})}
                          >
                            <option value="casa">Casa</option>
                            <option value="apartamento">Apartamento</option>
                            <option value="oficina">Oficina</option>
                          </select>
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Dirección *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={newAddress.direccion}
                            onChange={e => setNewAddress({...newAddress, direccion: e.target.value})}
                            placeholder="Carrera 1 # 2-3"
                          />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Barrio</label>
                          <input
                            type="text"
                            className="form-control"
                            value={newAddress.barrio}
                            onChange={e => setNewAddress({...newAddress, barrio: e.target.value})}
                            placeholder="Barrio"
                          />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">Teléfono</label>
                          <input
                            type="text"
                            className="form-control"
                            value={newAddress.telefono}
                            onChange={e => setNewAddress({...newAddress, telefono: e.target.value})}
                            placeholder="Teléfono"
                          />
                        </div>
                        <div className="d-flex gap-2 mt-2">
                          <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleAddAddress}>
                            <i className="fas fa-check me-1"></i>Guardar Dirección
                          </button>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNewAddress(false)}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mb-3">
                      <label htmlFor="direccion" className="form-label">Dirección *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.direccion ? 'is-invalid' : ''}`}
                        id="direccion"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        placeholder="Carrera 1 # 2-3"
                      />
                      {errors.direccion && <div className="invalid-feedback">{errors.direccion}</div>}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="direccion2" className="form-label">Apartamento / Suite (opcional)</label>
                      <input
                        type="text"
                        className="form-control"
                        id="direccion2"
                        name="direccion2"
                        value={formData.direccion2}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="barrio" className="form-label">Barrio</label>
                      <input
                        type="text"
                        className="form-control"
                        id="barrio"
                        name="barrio"
                        value={formData.barrio}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="telefono" className="form-label">Teléfono *</label>
                      <div className="input-group">
                        <select className="form-select w-auto" name="countryCode" value={formData.countryCode} onChange={handleChange}>
                          <option value="57">Colombia (+57)</option>
                          <option value="1">Estados Unidos (+1)</option>
                          <option value="34">España (+34)</option>
                          <option value="52">México (+52)</option>
                          <option value="44">Reino Unido (+44)</option>
                        </select>
                        <input
                          type="tel"
                          className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                          id="telefono"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                        />
                      </div>
                      {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
                    </div>
                  </>
                )}

                <hr />

                <div className="mb-3">
                  <label htmlFor="metodoPago" className="form-label">Método de pago</label>
                  <select className="form-select" id="metodoPago" name="metodoPago" value={formData.metodoPago} onChange={handleChange}>
                    {formData.delivery ? (
                      <>
                        <option key="abono" value="Abono">Abono</option>
                        <option key="transferencia" value="Transferencia">Transferencia</option>
                      </>
                    ) : (
                      <>
                        <option key="efectivo" value="Efectivo">Efectivo</option>
                        <option key="transferencia" value="Transferencia">Transferencia</option>
                        <option key="abono" value="Abono">Abono</option>
                      </>
                    )}
                  </select>
                </div>

                {formData.delivery && (
                  <div className="mb-3">
                    <label htmlFor="notasDomicilio" className="form-label">Notas para el repartidor (opcional)</label>
                    <textarea id="notasDomicilio" name="notasDomicilio" className="form-control" value={formData.notasDomicilio} onChange={handleChange} placeholder="Instrucciones especiales de entrega..." />
                  </div>
                )}

                {formData.metodoPago === 'Tarjeta' && (
                  <div id="cardFields">
                    <div className="mb-3">
                      <label htmlFor="cardNumber" className="form-label">Número de tarjeta *</label>
                      <input type="text" className={`form-control ${errors.cardNumber ? 'is-invalid' : ''}`} id="cardNumber" name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="1234 5678 9012 3456" />
                      {errors.cardNumber && <div className="invalid-feedback">{errors.cardNumber}</div>}
                    </div>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label htmlFor="cardExpiry" className="form-label">Expiración (MM/AA) *</label>
                        <input type="text" className={`form-control ${errors.cardExpiry ? 'is-invalid' : ''}`} id="cardExpiry" name="cardExpiry" value={formData.cardExpiry} onChange={handleChange} placeholder="MM/AA" />
                        {errors.cardExpiry && <div className="invalid-feedback">{errors.cardExpiry}</div>}
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="cardCvv" className="form-label">CVV *</label>
                        <input type="text" className={`form-control ${errors.cardCvv ? 'is-invalid' : ''}`} id="cardCvv" name="cardCvv" value={formData.cardCvv} onChange={handleChange} placeholder="123" />
                        {errors.cardCvv && <div className="invalid-feedback">{errors.cardCvv}</div>}
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="cardName" className="form-label">Nombre en tarjeta *</label>
                        <input type="text" className={`form-control ${errors.cardName ? 'is-invalid' : ''}`} id="cardName" name="cardName" value={formData.cardName} onChange={handleChange} />
                        {errors.cardName && <div className="invalid-feedback">{errors.cardName}</div>}
                      </div>
                    </div>
                  </div>
                )}

                {formData.delivery && (
                  <div className="alert alert-warning mb-3">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Nota:</strong> El precio del domicilio será asignado por la administración después de confirmar tu pedido.
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-lg w-100">
                  <i className="fas fa-check-circle me-2"></i>Confirmar Pedido{!formData.delivery && ` - ${formatPrice(total)}`}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">Resumen del pedido</div>
            <div className="card-body">
              {cartItemsWithDetails
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
              {formData.delivery ? (
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
        </div>
      </div>
    </div>
  );
};

export default Checkout;