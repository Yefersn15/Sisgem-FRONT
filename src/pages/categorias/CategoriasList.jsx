// src/pages/categorias/CategoriasList.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategorias } from './services/categoriasService';
import { useAyudaPagina } from '../../hooks/useAyudaPagina';

// Listado público de categorías: antes /categorias solo redirigía a
// /productos y no había ninguna página para explorar qué categorías existen
// (Home solo las usa como encabezado de sus carruseles). Cada categoría
// enlaza a su vitrina filtrada (ver ProductosPorCategoria, ruta
// /productos/por-categoria/:id).
const CategoriasList = () => {
  useAyudaPagina({
    titulo: 'Categorías',
    contenido: <p>Elige una categoría para ver únicamente sus productos.</p>,
  });
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategorias()
      .then((data) => setCategorias((data || []).filter((c) => c.activo !== false)))
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
      <h1 className="mb-4">Categorías</h1>
      {categorias.length === 0 ? (
        <div className="alert alert-info">No hay categorías disponibles.</div>
      ) : (
        <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-3">
          {categorias.map((c) => (
            <div className="col" key={c.id}>
              <Link
                to={`/productos/por-categoria/${c.id}`}
                className="card h-100 text-decoration-none text-center p-3 d-flex flex-column align-items-center justify-content-center"
              >
                <i className="fas fa-folder fa-2x text-secondary mb-2"></i>
                <small className="fw-semibold">{c.nombre}</small>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriasList;
