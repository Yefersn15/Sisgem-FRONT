import { useState } from 'react';

// Selector genérico "elige hasta N, en orden" — se usa para escoger a mano
// los productos/marcas de un banner. El orden de selección importa: define
// en qué casilla del collage cae cada uno (por eso `value` es un arreglo de
// ids, no un Set).
const EntityMultiPicker = ({ items, getLabel, getImage, value, onChange, max }) => {
  const [busqueda, setBusqueda] = useState('');
  const termino = busqueda.trim().toLowerCase();
  const filtrados = termino ? items.filter((it) => getLabel(it).toLowerCase().includes(termino)) : items;

  const toggle = (id) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else if (value.length < max) {
      onChange([...value, id]);
    }
  };

  return (
    <div>
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Buscar..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <div className="small text-muted mb-2">{value.length} / {max} seleccionados (el orden define la casilla)</div>
      <div className="d-flex flex-wrap gap-2 border rounded p-2" style={{ maxHeight: 260, overflowY: 'auto' }}>
        {filtrados.length === 0 && <span className="text-muted small p-2">Sin resultados.</span>}
        {filtrados.map((it) => {
          const seleccionado = value.includes(it.id);
          const posicion = seleccionado ? value.indexOf(it.id) + 1 : null;
          return (
            <button
              type="button"
              key={it.id}
              className={`btn btn-sm p-1 d-flex align-items-center gap-2 ${seleccionado ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => toggle(it.id)}
              disabled={!seleccionado && value.length >= max}
            >
              {getImage(it) ? (
                <img src={getImage(it)} alt="" style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4 }} />
              ) : (
                <span className="d-flex align-items-center justify-content-center bg-light rounded text-muted" style={{ width: 28, height: 28 }}>
                  <i className="fas fa-image small"></i>
                </span>
              )}
              <span className="text-truncate" style={{ maxWidth: 140 }}>{getLabel(it)}</span>
              {seleccionado && <span className="badge bg-white text-primary ms-1">{posicion}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EntityMultiPicker;
