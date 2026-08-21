// src/hooks/useMeasuredHeight.js
import { useRef, useState, useLayoutEffect } from 'react';

// Mide en vivo la altura de un elemento (por ejemplo un header fixed que
// salió del flujo normal) para poder compensarla con padding en el contenido.
export const useMeasuredHeight = () => {
  const ref = useRef(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => setHeight(el.offsetHeight);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, height];
};
