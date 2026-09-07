const InformacionContactoForm = ({ form, onChange }) => (
  <div>
    <h6 className="text-primary mb-3 border-bottom pb-2">Información de Contacto</h6>

    <div className="row g-3">
      <div className="col-md-6">
        <label className="form-label">Dirección</label>
        <input type="text" name="direccion" className="form-control" value={form.direccion} onChange={onChange} />
      </div>
      <div className="col-md-6">
        <label className="form-label">Barrio</label>
        <input type="text" name="barrio" className="form-control" value={form.barrio} onChange={onChange} />
      </div>
    </div>
  </div>
);

export default InformacionContactoForm;
