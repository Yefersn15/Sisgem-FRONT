import NuevaDireccionForm from './NuevaDireccionForm';

// Selector de dirección guardada (+ formulario de dirección nueva) y campos
// de entrega del checkout. Vive aparte de Checkout.jsx porque es una de las
// 3 secciones de negocio genuinamente distintas de esa página (junto a
// método de pago y resumen del pedido).
const DireccionEntregaFields = ({
  formData,
  errors,
  handleChange,
  direcciones,
  selectedDireccionId,
  handleDireccionSelect,
  showNewAddress,
  setShowNewAddress,
  newAddress,
  setNewAddress,
  handleAddAddress,
}) => (
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
);

export default DireccionEntregaFields;
