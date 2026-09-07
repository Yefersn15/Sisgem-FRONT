// src/pages/marcas/components/MarcaFormFields.jsx
import React from 'react';
import ImageUploadField from '../../../components/upload/ImageUploadField';

const MarcaFormFields = ({ formData, errors, onChange, logoRef }) => (
  <>
    <div className="mb-3">
      <div className="col-md-6">
        <label className="form-label">Nombre de la Marca *</label>
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
        value={formData.descripcion || ''}
        onChange={onChange}
      ></textarea>
      {errors.descripcion && <div className="invalid-feedback">{errors.descripcion}</div>}
    </div>

    <div className="row mb-3">
      <div className="col-md-6">
        <ImageUploadField
          ref={logoRef}
          label="Logo"
          name="logoUrl"
          value={formData.logoUrl}
          onChange={onChange}
          folder="marcas"
        />
      </div>
      <div className="col-md-6">
        <label className="form-label">Sitio Web</label>
        <input
          type="url"
          className={`form-control ${errors.sitioWeb ? 'is-invalid' : ''}`}
          name="sitioWeb"
          value={formData.sitioWeb || ''}
          onChange={onChange}
          placeholder="https://www.ejemplo.com"
        />
        {errors.sitioWeb && <div className="invalid-feedback">{errors.sitioWeb}</div>}
      </div>
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
        <label className="form-check-label">Marca activa</label>
      </div>
    </div>
  </>
);

export default MarcaFormFields;
