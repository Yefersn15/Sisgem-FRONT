// src/pages/roles/components/PermisosGrid.jsx
import React from 'react';

const traducirAccion = (accion) =>
  accion.replace('read', 'LEER').replace('write', 'ESCRIBIR').replace('delete', 'ELIMINAR');

const PermisosGrid = ({ categoriasPermisos, permisosSeleccionados, onTogglePermiso, onToggleCategoria, idPrefix }) => (
  <div className="row">
    {Object.entries(categoriasPermisos).map(([categoria, perms]) => {
      const allSelected = perms.every((p) => permisosSeleccionados.includes(p));
      return (
        <div key={categoria} className="col-md-4 mb-3">
          <div className="card border-secondary">
            <div className="card-header bg-light border-secondary py-2 d-flex justify-content-between align-items-center fw-bold text-dark">
              <span>{categoria.toUpperCase()}</span>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => onToggleCategoria(perms)}
                title="Seleccionar todos"
              />
            </div>
            <div className="card-body py-2">
              {perms.map((p) => (
                <div key={p} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`${idPrefix}-${p}`}
                    checked={permisosSeleccionados.includes(p)}
                    onChange={() => onTogglePermiso(p)}
                  />
                  <label
                    className={`form-check-label fw-bold ${permisosSeleccionados.includes(p) ? 'text-white bg-primary px-2 rounded' : ''}`}
                    htmlFor={`${idPrefix}-${p}`}
                    style={{ fontSize: '0.85rem' }}
                  >
                    {traducirAccion(p.split('.')[1])}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

export default PermisosGrid;
