// Días de un grupo de horario. FESTIVOS no es un día del calendario, es una
// categoría aparte que el admin puede agrupar con los que quiera (solo,
// junto al fin de semana, etc.) — por eso no entra en el conteo de
// consecutivos de formatDias.
export const DIAS = [
  { value: 'LUN', label: 'Lun' },
  { value: 'MAR', label: 'Mar' },
  { value: 'MIE', label: 'Mié' },
  { value: 'JUE', label: 'Jue' },
  { value: 'VIE', label: 'Vie' },
  { value: 'SAB', label: 'Sáb' },
  { value: 'DOM', label: 'Dom' },
  { value: 'FESTIVOS', label: 'Festivos' },
];

const ORDEN = DIAS.filter((d) => d.value !== 'FESTIVOS').map((d) => d.value);
const etiqueta = (valor) => DIAS.find((d) => d.value === valor)?.label || valor;

export const formatHora = (hhmm) => {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const periodo = h < 12 ? 'a. m.' : 'p. m.';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${periodo}`;
};

// "Lun a Vie", "Sáb y Dom", "Mié, Festivos" — agrupa días consecutivos para
// que se lea igual que como lo escribiría una persona, sin obligar al admin
// a elegir entre un horario fijo lunes-viernes/fin de semana.
export const formatDias = (dias = []) => {
  const festivos = dias.includes('FESTIVOS');
  const normales = dias.filter((d) => d !== 'FESTIVOS').sort((a, b) => ORDEN.indexOf(a) - ORDEN.indexOf(b));

  const grupos = [];
  for (const dia of normales) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ORDEN.indexOf(dia) === ORDEN.indexOf(ultimo[ultimo.length - 1]) + 1) {
      ultimo.push(dia);
    } else {
      grupos.push([dia]);
    }
  }

  const partes = grupos.map((g) => {
    if (g.length === 1) return etiqueta(g[0]);
    if (g.length === 2) return `${etiqueta(g[0])} y ${etiqueta(g[1])}`;
    return `${etiqueta(g[0])} a ${etiqueta(g[g.length - 1])}`;
  });

  if (festivos) partes.push('Festivos');
  return partes.join(', ');
};

export const formatearHorario = (reglas = []) =>
  reglas
    .filter((r) => r.dias?.length > 0)
    .map((r) => `${formatDias(r.dias)}: ${r.cerrado ? 'cerrado' : `${formatHora(r.apertura)} – ${formatHora(r.cierre)}`}`);
