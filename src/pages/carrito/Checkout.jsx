import { Link } from 'react-router-dom';
import { formatPrice } from '../../services/api/utils';
import { useCheckoutForm } from './hooks/useCheckoutForm';
import NuevaDireccionForm from './components/NuevaDireccionForm';
import ResumenPedido from './components/ResumenPedido';

const Checkout = () => {
  const {
    user,
    cartItemsWithDetails,
    direcciones,
    selectedDireccionId,
    showNewAddress,
    setShowNewAddress,
    newAddress,
    setNewAddress,
    formData,
    errors,
    subtotal,
    total,
    submitting,
    handleChange,
    handleDireccionSelect,
    handleAddAddress,
    handleSubmit,
  } = useCheckoutForm();

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
                        {direcciones.length < 3 && <option key="new" value="new">+ Agregar nueva dirección</option>}
                      </select>
                    </div>

                    {showNewAddress && (
                      <NuevaDireccionForm
                        newAddress={newAddress}
                        setNewAddress={setNewAddress}
                        onSave={handleAddAddress}
                        onCancel={() => setShowNewAddress(false)}
                      />
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
                      <label htmlFor="direccion2" className="form-label">Tipo de residencia (opcional)</label>
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
                        <option key="efectivo" value="Efectivo">Efectivo (contraentrega)</option>
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

                <button type="submit" className="btn btn-primary btn-lg w-100" disabled={submitting}>
                  {submitting ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Procesando...</>
                  ) : (
                    <><i className="fas fa-check-circle me-2"></i>Confirmar Pedido{!formData.delivery && ` - ${formatPrice(total)}`}</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <ResumenPedido items={cartItemsWithDetails} subtotal={subtotal} total={total} delivery={formData.delivery} />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
