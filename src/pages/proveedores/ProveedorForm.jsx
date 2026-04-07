// src/pages/proveedores/ProveedorForm.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProveedorForm = ({ initial = {}, onSubmit, submitLabel = 'Guardar' }) => {
  const [form, setForm] = useState({
    nombre: '',
    tipo_persona: 'Natural',
    tipo_documento: 'CC',
    documento: '',
    contacto: '',
    telefono: '',
    telefonoPais: '',
    email: '',
    direccion: '',
    rubro: '',
    estado: true,
    ...initial
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.nombre?.trim()) e.nombre = 'Nombre requerido';
    if (!form.documento?.trim()) e.documento = 'Documento requerido';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Información del Proveedor</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Nombre / Razón Social *</label>
              <input
                type="text"
                className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: OfficeMax Colombia S.A.S."
              />
              {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Tipo Persona</label>
              <select className="form-select" name="tipo_persona" value={form.tipo_persona} onChange={handleChange}>
                <option value="Natural">Natural</option>
                <option value="Jurídica">Jurídica</option>
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Tipo Documento</label>
              <select className="form-select" name="tipo_documento" value={form.tipo_documento} onChange={handleChange}>
                <option value="CC">CC</option>
                <option value="NIT">NIT</option>
                <option value="CE">CE</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Documento *</label>
              <input
                type="text"
                className={`form-control ${errors.documento ? 'is-invalid' : ''}`}
                name="documento"
                value={form.documento}
                onChange={handleChange}
                placeholder="Ej: 900.234.567-1"
              />
              {errors.documento && <div className="invalid-feedback">{errors.documento}</div>}
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Persona de Contacto</label>
              <input
                type="text"
                className="form-control"
                name="contacto"
                value={form.contacto}
                onChange={handleChange}
                placeholder="Nombre del representante"
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Rubro / Categoría</label>
              <input
                type="text"
                className="form-control"
                name="rubro"
                value={form.rubro}
                onChange={handleChange}
                placeholder="Ej: Papelería y consumibles"
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-3 mb-3">
              <label className="form-label">Código País</label>
              <input
                type="text"
                className="form-control"
                name="telefonoPais"
                value={form.telefonoPais}
                onChange={handleChange}
                placeholder="+57"
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Teléfono</label>
              <input
                type="text"
                className="form-control"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="310 456 7890"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="ventas@empresa.com.co"
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Dirección</label>
              <input
                type="text"
                className="form-control"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Ej: Cra. 15 #93-47, Bogotá D.C."
              />
            </div>
            <div className="col-md-3 mb-3 d-flex align-items-center">
              <div className="form-check mt-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="estado"
                  name="estado"
                  checked={!!form.estado}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="estado">Activo</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between">
        <Link to="/proveedores" className="btn btn-secondary">Cancelar</Link>
        <button type="submit" className="btn btn-primary">
          <i className="fas fa-save me-1"></i>
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ProveedorForm;