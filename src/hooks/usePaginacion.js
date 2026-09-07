// src/hooks/usePaginacion.js
import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Recuerda en qué página estaba el usuario en esta ruta (ej. al filtrar
// productos desde la página 3 y volver, sigue en la página 3), mientras dure
// la pestaña del navegador. Se guarda por ruta para no mezclar la página de
// un listado con la de otro. Tomado de Biblioteca_ReactVite
// (src/hooks/usePaginacion.js), mismo patrón para los listados públicos.
const leerPaginaGuardada = (clave) => {
  try {
    const valor = Number(sessionStorage.getItem(clave));
    return Number.isInteger(valor) && valor > 0 ? valor : 1;
  } catch {
    return 1;
  }
};

const guardarPagina = (clave, pagina) => {
  try {
    sessionStorage.setItem(clave, String(pagina));
  } catch {
    // sessionStorage puede fallar (modo privado, cuota llena): no es crítico.
  }
};

// Paginación en cliente sobre una lista ya cargada. `resetDeps` son los
// valores (filtros, búsqueda) que al cambiar deben volver a la página 1.
export const usePaginacion = (items, pageSize = 12, resetDeps = []) => {
  const { pathname } = useLocation();
  const claveStorage = `pagina:${pathname}`;
  const [pagina, setPaginaState] = useState(() => leerPaginaGuardada(claveStorage));
  const primerRender = useRef(true);

  const setPagina = (nuevaPagina) => {
    setPaginaState(nuevaPagina);
    guardarPagina(claveStorage, nuevaPagina);
  };

  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    setPagina(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resetDeps es intencionalmente dinámico por llamada
  }, resetDeps);

  const totalPaginas = Math.max(1, Math.ceil(items.length / pageSize));

  // Mientras `items` todavía está vacío por la carga inicial (no porque
  // realmente no haya resultados), `totalPaginas` vale 1 de forma transitoria;
  // recortar la página en ese momento borraría la página restaurada antes de
  // que lleguen los datos reales.
  useEffect(() => {
    if (items.length > 0 && pagina > totalPaginas) setPagina(totalPaginas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPaginas, pagina, items.length]);

  const itemsPagina = useMemo(() => {
    const inicio = (pagina - 1) * pageSize;
    return items.slice(inicio, inicio + pageSize);
  }, [items, pagina, pageSize]);

  return { pagina, setPagina, totalPaginas, itemsPagina };
};
