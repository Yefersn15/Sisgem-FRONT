// src/pages/marcas/MarcasList.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMarcas } from './services/marcasService';
import { useAyudaPagina } from '../../hooks/useAyudaPagina';

// Listado público de marcas: antes /marcas solo redirigía a /productos y no
// había ninguna página para explorar qué marcas existen (Home solo muestra
// un carrusel, sin un "ver todas"). Cada marca enlaza a su vitrina filtrada
// (ver ProductosPorMarca, ruta /productos/por-marca/:id).
const MarcasList = () => {
  useAyudaPagina({
    titulo: 'Marcas',
    contenido: <p>Elige una marca para ver únicamente sus productos.</p>,
  });
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMarcas()
      .then((data) => setMarcas((data || []).filter((m) => m.activo !== false)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container my-4 text-center">
        <div className="spinner-border" role="status"><span className="visually-hidden">Cargando...</span></div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <h1 className="mb-4">Marcas</h1>
      {marcas.length === 0 ? (
        <div className="alert alert-info">No hay marcas disponibles.</div>
      ) : (
        <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 g-3">
          {marcas.map((m) => (
            <div className="col" key={m.id}>
              <Link
                to={`/productos/por-marca/${m.id}`}
                className="card h-100 text-decoration-none text-center p-3 d-flex flex-column align-items-center justify-content-center"
              >
                {(m.logoUrl || m.logo) ? (
                  <img
                    src={m.logoUrl || m.logo}
                    alt={m.nombre}
                    className="mb-2"
                    style={{ maxHeight: 60, maxWidth: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <i className="fas fa-industry fa-2x text-secondary mb-2"></i>
                )}
                <small className="fw-semibold">{m.nombre}</small>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarcasList;
