// src/pages/home/components/CategoriaCarousel.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteCarousel } from '../hooks/useInfiniteCarousel';

const CategoriaCarousel = ({ categoria, productos, onOpenProducto }) => {
  const { trackRef, translatePx } = useInfiniteCarousel(productos);

  if (!productos || productos.length === 0) return null;

  return (
    <div className="mb-5">
      <h3 className="mb-3">
        <Link to={`/productos/por-categoria/${categoria.id}`} className="text-decoration-none">
          {categoria.nombre}
        </Link>
      </h3>
      <div className="infinite-brands-wrapper productos">
        <div ref={trackRef} className="infinite-brands-track" style={{ ['--translate-x']: `${translatePx}px` }}>
          {([...productos, ...productos]).map((p, idx) => (
            <div key={`${p.id}-${idx}`} className="infinite-product-item">
              <div className="card shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => onOpenProducto(p)}>
                <img
                  src={p.fotoUrl || p.foto || 'https://via.placeholder.com/400'}
                  className="card-img-top"
                  alt={p.nombre}
                  style={{ backgroundColor: 'var(--surface2)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriaCarousel;
