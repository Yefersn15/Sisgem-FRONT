// src/pages/marcas/components/MarcaCard.jsx
import { Link } from 'react-router-dom';

// Modelada sobre AutorCard.jsx de Biblioteca_ReactVite: la marca es al
// producto lo que el autor es al libro, así que el listado público de
// marcas (ver MarcasList.jsx) usa la misma tarjeta circular + nombre.
const MarcaCard = ({ marca }) => (
  <Link to={`/productos/por-marca/${marca.id}`} className="text-decoration-none text-dark">
    <div className="card h-100 shadow-sm text-center">
      <div className="card-body">
        {(marca.logoUrl || marca.logo) ? (
          <img
            src={marca.logoUrl || marca.logo}
            alt=""
            className="rounded-circle mb-2"
            style={{ width: 80, height: 80, objectFit: 'contain', background: '#e9ecef', margin: '0 auto' }}
          />
        ) : (
          <div className="rounded-circle mb-2 mx-auto d-flex align-items-center justify-content-center text-muted" style={{ width: 80, height: 80, background: '#e9ecef' }}>
            <i className="fas fa-industry fa-2x"></i>
          </div>
        )}
        <div className="fw-bold">{marca.nombre}</div>
        {marca.descripcion && <div className="small text-muted text-truncate">{marca.descripcion}</div>}
      </div>
    </div>
  </Link>
);

export default MarcaCard;
