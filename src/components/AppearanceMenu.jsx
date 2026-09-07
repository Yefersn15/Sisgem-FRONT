// src/components/AppearanceMenu.jsx
import React from 'react';

// Agrupa tema (claro/oscuro) y orientación del menú (lateral/superior) en un
// único dropdown. Se usa tanto en el header del admin como en el de la
// tienda; en la tienda además se le pasa `vistaLlamativa`/`setVistaLlamativa`
// para sumar la sección "Vista de inicio" (el admin no la recibe, así que
// esa sección no se renderiza ahí).
const AppearanceMenu = ({ isDark, onSetTheme, isTopbar, onOrientationChange, vistaLlamativa, setVistaLlamativa }) => (
  <div className="dropdown me-2">
    <button
      className="btn btn-outline-theme dropdown-toggle btn-sm"
      data-bs-toggle="dropdown"
      title="Apariencia"
      aria-label="Apariencia"
    >
      <i className={`fas ${isDark ? 'fa-moon' : 'fa-sun'}`}></i>
    </button>
    <ul className="dropdown-menu dropdown-menu-end">
      <li><h6 className="dropdown-header">Tema</h6></li>
      <li>
        <button className={`dropdown-item d-flex align-items-center gap-2 ${!isDark ? 'active' : ''}`} onClick={() => onSetTheme(false)}>
          <i className="fas fa-sun"></i><span>Claro</span>
        </button>
      </li>
      <li>
        <button className={`dropdown-item d-flex align-items-center gap-2 ${isDark ? 'active' : ''}`} onClick={() => onSetTheme(true)}>
          <i className="fas fa-moon"></i><span>Oscuro</span>
        </button>
      </li>
      <li><hr className="dropdown-divider" /></li>
      <li><h6 className="dropdown-header">Vista del menú</h6></li>
      <li>
        <button className={`dropdown-item d-flex align-items-center gap-2 ${!isTopbar ? 'active' : ''}`} onClick={() => onOrientationChange('sidebar')}>
          <i className="fas fa-table-columns"></i><span>Barra lateral</span>
        </button>
      </li>
      <li>
        <button className={`dropdown-item d-flex align-items-center gap-2 ${isTopbar ? 'active' : ''}`} onClick={() => onOrientationChange('topbar')}>
          <i className="fas fa-bars"></i><span>Barra superior</span>
        </button>
      </li>
      {setVistaLlamativa && (
        <>
          <li><hr className="dropdown-divider" /></li>
          <li><h6 className="dropdown-header">Vista de inicio</h6></li>
          <li>
            <button className={`dropdown-item d-flex align-items-center gap-2 ${!vistaLlamativa ? 'active' : ''}`} onClick={() => setVistaLlamativa(false)}>
              <i className="fas fa-house"></i><span>Clásica</span>
            </button>
          </li>
          <li>
            <button className={`dropdown-item d-flex align-items-center gap-2 ${vistaLlamativa ? 'active' : ''}`} onClick={() => setVistaLlamativa(true)}>
              <i className="fas fa-wand-magic-sparkles"></i><span>Llamativa</span>
            </button>
          </li>
        </>
      )}
    </ul>
  </div>
);

export default AppearanceMenu;
