// src/pages/configuracion/components/HorarioBuilder.jsx
import { DIAS, formatearHorario } from '../../../utils/horario';

const REGLA_INICIAL = { dias: [], cerrado: false, apertura: '08:00', cierre: '18:00' };

const HorarioBuilder = ({ reglas, onChange }) => {
  const actualizarRegla = (i, cambios) => onChange(reglas.map((r, idx) => (idx === i ? { ...r, ...cambios } : r)));
  const toggleDia = (i, dia) => {
    const regla = reglas[i];
    const dias = regla.dias.includes(dia) ? regla.dias.filter((d) => d !== dia) : [...regla.dias, dia];
    actualizarRegla(i, { dias });
  };
  const agregar = () => onChange([...reglas, { ...REGLA_INICIAL }]);
  const quitar = (i) => onChange(reglas.filter((_, idx) => idx !== i));

  const vistaPrevia = formatearHorario(reglas);

  return (
    <div>
      {reglas.map((regla, i) => {
        const sinDias = regla.dias.length === 0;
        const cierreInvalido = !regla.cerrado && regla.apertura && regla.cierre && regla.cierre <= regla.apertura;

        return (
        <div className="border rounded p-3 mb-2" key={i}>
          <div className="d-flex flex-wrap gap-1 mb-2">
            {DIAS.map((d) => (
              <button
                key={d.value}
                type="button"
                className={`btn btn-sm ${regla.dias.includes(d.value) ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => toggleDia(i, d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
          {sinDias && <div className="small text-danger mb-2">Selecciona al menos un día para este grupo</div>}
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id={`cerrado-${i}`}
                checked={regla.cerrado}
                onChange={(e) => actualizarRegla(i, { cerrado: e.target.checked })}
              />
              <label className="form-check-label" htmlFor={`cerrado-${i}`}>Cerrado</label>
            </div>
            {!regla.cerrado && (
              <>
                <div>
                  <label className="form-label small mb-0 d-block">Apertura</label>
                  <input
                    type="time"
                    className="form-control form-control-sm"
                    required
                    value={regla.apertura || ''}
                    onChange={(e) => actualizarRegla(i, { apertura: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label small mb-0 d-block">Cierre</label>
                  <input
                    type="time"
                    className={`form-control form-control-sm ${cierreInvalido ? 'is-invalid' : ''}`}
                    required
                    value={regla.cierre || ''}
                    onChange={(e) => actualizarRegla(i, { cierre: e.target.value })}
                  />
                </div>
                {cierreInvalido && <div className="small text-danger w-100">La hora de cierre debe ser posterior a la de apertura</div>}
              </>
            )}
            <button type="button" className="btn btn-sm btn-outline-danger ms-auto" onClick={() => quitar(i)}>
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>
        );
      })}

      <button type="button" className="btn btn-sm btn-outline-primary" onClick={agregar}>
        <i className="fas fa-plus me-1"></i>Agregar grupo de horario
      </button>

      {vistaPrevia.length > 0 && (
        <div className="mt-3 small text-muted">
          <strong>Así se verá:</strong>
          <ul className="mb-0">
            {vistaPrevia.map((linea, i) => <li key={i}>{linea}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HorarioBuilder;
