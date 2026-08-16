// src/pages/productos/components/ProductoFormFields.jsx
import React from 'react';
import ImageUploadField from '../../../components/ImageUploadField';

const ProductoFormFields = ({ formData, errors, onChange, categorias, marcas }) => (
  <>
    <div className="row mb-3">
      <div className="col-md-6">
        <label className="form-label">Nombre del Producto *</label>
        <input
          type="text"
          className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
          name="nombre"
          value={formData.nombre}
          onChange={onChange}
        />
        {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
      </div>
      <div className="col-md-6">
        <label className="form-label">Código de Barras</label>
        <input
          type="text"
          className={`form-control ${errors.barcode ? 'is-invalid' : ''}`}
          name="barcode"
          value={formData.barcode || ''}
          onChange={onChange}
          onInput={(e) => { e.target.value = e.target.value.toUpperCase(); }}
        />
        {errors.barcode && <div className="invalid-feedback">{errors.barcode}</div>}
      </div>
    </div>

    <div className="mb-3">
      <label className="form-label">Descripción *</label>
      <textarea
        className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
        name="descripcion"
        rows="3"
        value={formData.descripcion}
        onChange={onChange}
      ></textarea>
      {errors.descripcion && <div className="invalid-feedback">{errors.descripcion}</div>}
    </div>

    <div className="row mb-3">
      <div className="col-md-6">
        <label className="form-label">Categoría *</label>
        <select
          className={`form-select ${errors.categoriaId ? 'is-invalid' : ''}`}
          name="categoriaId"
          value={formData.categoriaId}
          onChange={onChange}
        >
          <option value="">-- Seleccione Categoría --</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
        {errors.categoriaId && <div className="invalid-feedback">{errors.categoriaId}</div>}
      </div>
      <div className="col-md-6">
        <label className="form-label">Marca *</label>
        <select
          className={`form-select ${errors.marcaId ? 'is-invalid' : ''}`}
          name="marcaId"
          value={formData.marcaId}
          onChange={onChange}
        >
          <option value="">-- Seleccione Marca --</option>
          {marcas.map(m => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>
        {errors.marcaId && <div className="invalid-feedback">{errors.marcaId}</div>}
      </div>
    </div>

    <div className="row mb-3">
      <div className="col-md-6">
        <label className="form-label">Precio Unitario *</label>
        <div className="input-group">
          <span className="input-group-text">$</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className={`form-control ${errors.precioUnitario ? 'is-invalid' : ''}`}
            name="precioUnitario"
            value={formData.precioUnitario}
            onChange={onChange}
          />
        </div>
        {errors.precioUnitario && <div className="invalid-feedback">{errors.precioUnitario}</div>}
      </div>
      <div className="col-md-6">
        <label className="form-label">Stock Disponible *</label>
        <input
          type="number"
          min="0"
          className={`form-control ${errors.stockDisponible ? 'is-invalid' : ''}`}
          name="stockDisponible"
          value={formData.stockDisponible}
          onChange={onChange}
        />
        {errors.stockDisponible && <div className="invalid-feedback">{errors.stockDisponible}</div>}
      </div>
    </div>

    <div className="mb-3">
      <ImageUploadField
        label="Imagen del producto"
        name="fotoUrl"
        value={formData.fotoUrl}
        onChange={onChange}
        folder="productos"
      />
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
        <label className="form-check-label">Producto activo (visible en el catálogo)</label>
      </div>
    </div>
  </>
);

export default ProductoFormFields;
