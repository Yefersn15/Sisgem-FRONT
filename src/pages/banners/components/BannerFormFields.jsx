// src/pages/banners/components/BannerFormFields.jsx
import React from 'react';
import BannerTemplatePicker from './BannerTemplatePicker';
import BannerCollage from './BannerCollage';
import EntityMultiPicker from './EntityMultiPicker';
import ImageUploadField from '../../../components/upload/ImageUploadField';
import { getTemplate } from '../hooks/bannerTemplates';

const TEXT_POSITIONS = [
  { value: 'none', label: 'Sin texto' },
  { value: 'left', label: 'Texto a la izquierda' },
  { value: 'right', label: 'Texto a la derecha' },
  { value: 'center', label: 'Texto centrado' },
];

const CONTENT_TYPES = [
  { value: 'imagenes', label: 'Imágenes personalizadas' },
  { value: 'productos', label: 'Productos elegidos a mano' },
  { value: 'marcas', label: 'Marcas elegidas a mano' },
  { value: 'populares_marca', label: 'Más vendidos de una marca' },
  { value: 'populares_categoria', label: 'Más vendidos de una categoría' },
];

// Construye la vista previa cuando el contenido es "vivo" (productos/marcas
// elegidos a mano): se arma en el navegador a partir de las listas ya
// cargadas, sin llamar al backend. Los tipos "populares" no tienen vista
// previa (dependen de ventas reales, se resuelven solo al guardar).
const construirPreviewVivo = (contentType, contentRefs, productos, marcas) => {
  if (contentType === 'productos') {
    return (contentRefs || []).map((id) => {
      const p = productos.find((x) => String(x.id) === String(id));
      return p ? { url: p.fotoUrl, nombre: p.nombre, precio: p.precioUnitario } : { url: '' };
    });
  }
  if (contentType === 'marcas') {
    return (contentRefs || []).map((id) => {
      const m = marcas.find((x) => String(x.id) === String(id));
      return m ? { url: m.logoUrl, nombre: m.nombre } : { url: '' };
    });
  }
  return [];
};

const BannerFormFields = ({ form, errors, setLayout, setImageUrl, setField, setContentType, setContentRefs, productos = [], marcas = [], categorias = [], getImageRef }) => {
  const template = getTemplate(form.layout);
  const contentType = form.contentType || 'imagenes';

  return (
  <>
    <div className="mb-4">
      <label className="form-label fw-bold">Plantilla de collage</label>
      <BannerTemplatePicker value={form.layout} onChange={setLayout} />
    </div>

    <div className="mb-4">
      <label className="form-label fw-bold">Tipo de contenido</label>
      <select className="form-select" value={contentType} onChange={(e) => setContentType(e.target.value)}>
        {CONTENT_TYPES.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>

    {contentType === 'imagenes' && (
      <div className="mb-4">
        <label className="form-label fw-bold">Imágenes</label>
        {errors.images && <div className="alert alert-danger py-2">{errors.images}</div>}
        <div className="row g-3">
          {form.images.map((img, i) => (
            <div className="col-md-6" key={i}>
              <ImageUploadField
                ref={getImageRef(i)}
                label={`Imagen ${i + 1}`}
                value={img.url}
                onValueChange={(url) => setImageUrl(i, url)}
                folder="banners"
                maxWidth={template.maxWidth}
                size={64}
              />
            </div>
          ))}
        </div>
      </div>
    )}

    {(contentType === 'productos' || contentType === 'marcas') && (
      <div className="mb-4">
        <label className="form-label fw-bold">
          {contentType === 'productos' ? 'Productos para el banner' : 'Marcas para el banner'}
        </label>
        {errors.contentRefs && <div className="alert alert-danger py-2">{errors.contentRefs}</div>}
        <EntityMultiPicker
          items={contentType === 'productos' ? productos : marcas}
          getLabel={(it) => it.nombre}
          getImage={(it) => (contentType === 'productos' ? it.fotoUrl : it.logoUrl)}
          value={form.contentRefs || []}
          onChange={setContentRefs}
          max={template.slots}
        />
      </div>
    )}

    {(contentType === 'populares_marca' || contentType === 'populares_categoria') && (
      <div className="mb-4">
        <label className="form-label fw-bold">
          {contentType === 'populares_marca' ? 'Marca de referencia' : 'Categoría de referencia'}
        </label>
        {errors.contentRefs && <div className="alert alert-danger py-2">{errors.contentRefs}</div>}
        <select
          className="form-select"
          value={form.contentRefs?.refId || ''}
          onChange={(e) => setContentRefs({ refId: e.target.value, limit: template.slots })}
        >
          <option value="">Selecciona...</option>
          {(contentType === 'populares_marca' ? marcas : categorias).map((it) => (
            <option key={it.id} value={it.id}>{it.nombre}</option>
          ))}
        </select>
        <small className="text-muted d-block mt-1">
          Se llenan automáticamente hasta {template.slots} casillas con los productos más vendidos de esa {contentType === 'populares_marca' ? 'marca' : 'categoría'}. Se actualiza solo, sin volver a editar el banner.
        </small>
      </div>
    )}

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
      {(contentType === 'populares_marca' || contentType === 'populares_categoria') ? (
        <div className="alert alert-info py-2 mb-0">
          La vista previa de "más vendidos" se arma con las ventas reales al guardar el banner.
        </div>
      ) : (
        <BannerCollage
          layout={form.layout}
          images={contentType === 'imagenes' ? form.images : construirPreviewVivo(contentType, form.contentRefs, productos, marcas)}
          titulo={form.titulo}
          texto={form.texto}
          textPosition={form.textPosition}
          height={260}
        />
      )}
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
};

export default BannerFormFields;
