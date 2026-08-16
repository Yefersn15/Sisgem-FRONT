// src/pages/home/hooks/useInfiniteCarousel.js
import { useRef, useState, useLayoutEffect } from 'react';

export const useInfiniteCarousel = (items) => {
  const trackRef = useRef(null);
  const [translatePx, setTranslatePx] = useState(0);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const total = el.scrollWidth || 0;
    const half = Math.floor(total / 2);
    setTranslatePx(-half);
    el.style.setProperty('--translate-x', `${-half}px`);
    const dur = Math.max(8, Math.round(half / 60));
    el.style.animationDuration = `${dur}s`;
  }, [items]);

  return { trackRef, translatePx };
};
