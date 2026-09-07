// src/pages/marcas/MarcasList.jsx
import { useEffect, useState } from 'react';
import { getMarcas } from './services/marcasService';
import MarcaCard from './components/MarcaCard';
import { useBusquedaOrden, ORDEN_OPCIONES } from '../../hooks/useBusquedaOrden';
import { usePaginacion } from '../../hooks/usePaginacion';
import Pagination from '../../components/Pagination';
import { useAyudaPagina } from '../../hooks/useAyudaPagina';

const getTexto = (m) => m.nombre;
const getPopularidad = (m) => m.cantidadProductos || 0;

// Listado público de marcas: antes /marcas solo redirigía a /productos y no
// había ninguna página para explorar qué marcas existen (Home solo muestra
// un carrusel, sin un "ver todas"). Modelada sobre AutoresPublicos.jsx de
// Biblioteca_ReactVite (la marca es al producto lo que el autor es al
// libro): búsqueda + orden + paginación sobre las marcas activas, cada una
// enlazando a su vitrina filtrada (ver ProductosPorMarca, ruta
// /productos/por-marca/:id).
const MarcasList = () => {
  useAyudaPagina({
    titulo: 'Marcas',
    contenido: <p>Lista de marcas activas. Busca por nombre u ordénalas por popularidad (cantidad de productos); haz clic en una para ver únicamente sus productos.</p>,
  });
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMarcas()
      .then((data) => setMarcas((data || []).filter((m) => m.activo !== false)))
      .finally(() => setLoading(false));
  }, []);

  const { busqueda, setBusqueda, orden, setOrden, resultado } = useBusquedaOrden(marcas, getTexto, getPopularidad);
  const { pagina, setPagina, totalPaginas, itemsPagina } = usePaginacion(resultado, 8, [busqueda, orden]);

  return (
    <div className="container py-4">
      <h2 className="mb-4"><i className="fas fa-tag me-2 text-tema-acento"></i>Marcas</h2>

      <div className="row g-2 mb-4">
        <div className="col-md-8">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select className="form-select" value={orden} onChange={(e) => setOrden(e.target.value)}>
            {ORDEN_OPCIONES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
      ) : resultado.length === 0 ? (
        <div className="alert alert-info text-center">
          <i className="fas fa-tag fa-3x mb-3"></i>
          <h4>No hay marcas disponibles</h4>
          <p>Prueba con otra búsqueda o vuelve más tarde.</p>
        </div>
      ) : (
        <>
          <div className="row g-4">
            {itemsPagina.map((m) => (
              <div className="col-6 col-md-4 col-lg-3" key={m.id}>
                <MarcaCard marca={m} />
              </div>
            ))}
          </div>
          <Pagination currentPage={pagina} totalPages={totalPaginas} onPageChange={setPagina} />
        </>
      )}
    </div>
  );
};

export default MarcasList;
