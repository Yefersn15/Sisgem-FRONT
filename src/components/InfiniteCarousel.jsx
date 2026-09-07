// Carrusel de scroll automático e infinito: la lista de ítems se duplica una
// vez y la pista se desplaza -50% en loop, así que cuando la primera copia
// termina de salir, la segunda ya está exactamente en su lugar (el loop no
// se nota). Se pausa al pasar el mouse para poder hacer clic con comodidad.
// `direction="vertical"` reutiliza el mismo mecanismo para los bordes de la
// vista llamativa del inicio, desplazando de arriba hacia abajo en vez de
// izquierda a derecha.
const InfiniteCarousel = ({ items, renderItem, itemWidth = 160, itemHeight, speed = 40, direction = 'horizontal' }) => {
  if (items.length === 0) return null;

  const esVertical = direction === 'vertical';
  const tamanoItem = esVertical ? (itemHeight || itemWidth) : itemWidth;
  const duplicados = [...items, ...items];
  const duracion = Math.max(10, (items.length * tamanoItem) / speed);

  return (
    <div className={`infinite-carousel${esVertical ? ' infinite-carousel-vertical' : ''}`}>
      <div className="infinite-carousel-track" style={{ animationDuration: `${duracion}s` }}>
        {duplicados.map((item, i) => (
          <div
            className="infinite-carousel-item"
            style={esVertical ? undefined : { width: itemWidth }}
            key={i}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfiniteCarousel;
