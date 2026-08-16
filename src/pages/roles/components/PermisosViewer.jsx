// src/pages/roles/components/PermisosViewer.jsx
import React from 'react';

const traducirAccion = (accion) =>
  accion.replace('read', 'Leer').replace('write', 'Escribir').replace('delete', 'Eliminar');

const PermisosViewer = ({ rol, categoriasPermisos }) => {
  const asignados = rol.permisos || [];

  return (
    <div className="p-3">
      <h6>Permisos de {rol.nombre}:</h6>
      <div className="row">
        {Object.entries(categoriasPermisos).map(([categoria, permisos]) => (
          <div key={categoria} className="col-md-4 mb-3">
            <div className="card border-secondary">
              <div className="card-header bg-light border-secondary py-2 fw-bold text-dark">
                {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
              </div>
              <div className="card-body py-2">
                {permisos.map((p) => (
                  <div key={p} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`${rol.id}-${p}`}
                      checked={asignados.includes(p)}
                      disabled
                    />
                    <label
                      className={`form-check-label fw-bold ${asignados.includes(p) ? 'text-white bg-success px-2 rounded' : 'text-muted'}`}
                      htmlFor={`${rol.id}-${p}`}
                      style={{ fontSize: '0.8rem' }}
                    >
                      {traducirAccion(p.split('.')[1])}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PermisosViewer;
