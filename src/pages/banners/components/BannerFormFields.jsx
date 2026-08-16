// src/pages/banners/components/BannerFormFields.jsx
import React from 'react';
import BannerTemplatePicker from './BannerTemplatePicker';
import BannerCollage from './BannerCollage';
import ImageUploadField from '../../../components/ImageUploadField';

const TEXT_POSITIONS = [
  { value: 'none', label: 'Sin texto' },
  { value: 'left', label: 'Texto a la izquierda' },
  { value: 'right', label: 'Texto a la derecha' },
  { value: 'center', label: 'Texto centrado' },
];

const BannerFormFields = ({ form, errors, setLayout, setImageUrl, setField }) => (
  <>
    <div className="mb-4">
      <label className="form-label fw-bold">Plantilla de collage</label>
      <BannerTemplatePicker value={form.layout} onChange={setLayout} />
    </div>

    <div className="mb-4">
      <label className="form-label fw-bold">Imágenes</label>
      {errors.images && <div className="alert alert-danger py-2">{errors.images}</div>}
      <div className="row g-3">
        {form.images.map((img, i) => (
          <div className="col-md-6" key={i}>
            <ImageUploadField
              label={`Imagen ${i + 1}`}
              value={img.url}
              onValueChange={(url) => setImageUrl(i, url)}
              folder="banners"
              size={64}
            />
          </div>
        ))}
      </div>
    </div>

    <div className="row mb-4">
      <div className="col-md-6">
        <label className="form-label">Título (opcional)</label>
        <input
          type="text"
          className="form-control"
          value={form.titulo}
          onChange={(e) => setField('titulo', e.target.value)}
        />
      </div>
      <div className="col-md-6">
        <label className="form-label">Posición del texto</label>
        <select
          className="form-select"
          value={form.textPosition}
          onChange={(e) => setField('textPosition', e.target.value)}
        >
          {TEXT_POSITIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {form.textPosition !== 'none' && (
        <div className="col-12 mt-3">
          <label className="form-label">Texto</label>
          <textarea
            className={`form-control ${errors.texto ? 'is-invalid' : ''}`}
            rows={2}
            value={form.texto}
            onChange={(e) => setField('texto', e.target.value)}
          />
          {errors.texto && <div className="invalid-feedback">{errors.texto}</div>}
        </div>
      )}
    </div>

    <div className="mb-4">
      <label className="form-label fw-bold">Vista previa</label>
      <BannerCollage
        layout={form.layout}
        images={form.images}
        titulo={form.titulo}
        texto={form.texto}
        textPosition={form.textPosition}
        height={260}
      />
    </div>

    <div className="mb-3 form-check">
      <input
        type="checkbox"
        className="form-check-input"
        id="bannerEstado"
        checked={form.estado}
        onChange={(e) => setField('estado', e.target.checked)}
      />
      <label className="form-check-label" htmlFor="bannerEstado">Banner activo (visible en la tienda)</label>
    </div>
  </>
);

export default BannerFormFields;
