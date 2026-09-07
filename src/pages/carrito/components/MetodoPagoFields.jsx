// Selección de método de pago, notas para el repartidor, y campos de
// tarjeta (si aplica). Vive aparte de Checkout.jsx porque es una de las 3
// secciones de negocio genuinamente distintas de esa página (junto a
// dirección de entrega y resumen del pedido).
const MetodoPagoFields = ({ formData, errors, handleChange }) => (
  <>
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
  </>
);

export default MetodoPagoFields;
