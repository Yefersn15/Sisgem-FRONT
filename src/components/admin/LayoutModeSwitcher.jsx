// src/components/admin/LayoutModeSwitcher.jsx
import React from 'react';

const MODES = [
  { value: 'sidebar-full', icon: 'fa-table-columns', label: 'Barra lateral' },
  { value: 'sidebar-compact', icon: 'fa-list', label: 'Barra lateral compacta (solo iconos)' },
  { value: 'topbar-full', icon: 'fa-bars', label: 'Barra superior' },
  { value: 'topbar-compact', icon: 'fa-ellipsis', label: 'Barra superior compacta (solo iconos)' },
];

const LayoutModeSwitcher = ({ layoutMode, onChange }) => (
  <div className="dropdown me-2">
    <button
      className="btn btn-outline-theme dropdown-toggle btn-sm"
      data-bs-toggle="dropdown"
      title="Diseño del panel"
      aria-label="Cambiar diseño del panel"
    >
      <i className="fas fa-table-cells-large"></i>
    </button>
    <ul className="dropdown-menu dropdown-menu-end">
      {MODES.map(mode => (
        <li key={mode.value}>
          <button
            type="button"
            className={`dropdown-item d-flex align-items-center gap-2 ${layoutMode === mode.value ? 'active' : ''}`}
            onClick={() => onChange(mode.value)}
          >
            <i className={`fas ${mode.icon}`}></i>
            <span>{mode.label}</span>
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default LayoutModeSwitcher;
