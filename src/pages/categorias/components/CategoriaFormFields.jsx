// src/pages/categorias/components/CategoriaFormFields.jsx
import React from 'react';

const CategoriaFormFields = ({ formData, errors, onChange }) => (
  <>
    <div className="mb-3">
      <div className="col-md-6">
        <label className="form-label">Nombre de la Categoría *</label>
        <input
          type="text"
          className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
          name="nombre"
          value={formData.nombre}
          onChange={onChange}
        />
        {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
      </div>
    </div>

    <div className="mb-3">
      <label className="form-label">Descripción</label>
      <textarea
        className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
        name="descripcion"
        rows="3"
        value={formData.descripcion}
        onChange={onChange}
      ></textarea>
      {errors.descripcion && <div className="invalid-feedback">{errors.descripcion}</div>}
    </div>

    <div className="mb-3">
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          name="activo"
          checked={formData.activo}
          onChange={onChange}
        />
        <label className="form-check-label">Categoría activa</label>
      </div>
    </div>
  </>
);

export default CategoriaFormFields;
