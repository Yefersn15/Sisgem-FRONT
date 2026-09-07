import { useEffect, useRef } from 'react';
import { aplicarTemaCss } from '../../../utils/tema';
import { useConfiguracion } from '../../../context/ConfiguracionContext';

// Selector del color de acento de la tienda (botones, enlaces, bordes de
// foco — las variables --accent/--accent-hover/--accent-dim que ya usa toda
// la app). Vista previa en vivo: se aplica de inmediato mientras se elige, y
// si se sale de esta página sin guardar se restaura el color realmente
// guardado.
const SelectorTema = ({ value, onChange }) => {
  const colorAcento = value?.colorAcento || '#3b82f6';
  const { tema } = useConfiguracion();
  const colorGuardadoRef = useRef(tema?.colorAcento || colorAcento);

  useEffect(() => {
    colorGuardadoRef.current = tema?.colorAcento || colorAcento;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe registrar lo que hay realmente guardado
  }, [tema?.colorAcento]);

  useEffect(() => {
    aplicarTemaCss(colorAcento);
    return () => aplicarTemaCss(colorGuardadoRef.current);
  }, [colorAcento]);

  return (
    <div className="d-flex align-items-center gap-3">
      <input
        type="color"
        className="form-control form-control-color"
        value={colorAcento}
        onChange={(e) => onChange({ colorAcento: e.target.value })}
        title="Color de acento"
      />
      <span
        className="rounded px-3 py-1 small fw-semibold text-white"
        style={{ background: colorAcento }}
      >
        Vista previa
      </span>
    </div>
  );
};

export default SelectorTema;
