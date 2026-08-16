// src/pages/banners/components/BannerTemplatePicker.jsx
import React from 'react';
import { BANNER_TEMPLATES, SLOT_LETTERS } from '../hooks/bannerTemplates';

const BannerTemplatePicker = ({ value, onChange }) => (
  <div className="row g-3">
    {BANNER_TEMPLATES.map(template => (
      <div className="col-6 col-md-4 col-lg-2" key={template.key}>
        <button
          type="button"
          className={`card w-100 h-100 p-2 border-2 text-center ${value === template.key ? 'border-primary' : ''}`}
          style={{ cursor: 'pointer', background: 'transparent' }}
          onClick={() => onChange(template.key)}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateAreas: template.areas,
              gridTemplateColumns: template.cols,
              gridTemplateRows: template.rows,
              gap: '3px',
              height: '48px',
              marginBottom: '8px',
            }}
          >
            {Array.from({ length: template.slots }).map((_, i) => (
              <div
                key={i}
                style={{
                  gridArea: SLOT_LETTERS[i],
                  background: value === template.key ? 'var(--accent)' : 'var(--surface3)',
                  borderRadius: 3,
                }}
              />
            ))}
          </div>
          <small className={value === template.key ? 'text-primary fw-bold' : 'text-muted'}>{template.label}</small>
        </button>
      </div>
    ))}
  </div>
);

export default BannerTemplatePicker;
