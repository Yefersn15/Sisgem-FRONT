import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDebounce from '../../hooks/useDebounce';
import { getMarcas, getProveedores } from '../../services/dataService';

const MarcasList = () => {
  const navigate = useNavigate();
  const [marcas, setMarcas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    const init = async () => {
      await cargarMarcas();
    };
    init();
  }, [debouncedSearch, sortBy]);

  const cargarMarcas = async () => {
    let lista = await getMarcas();
    if (!Array.isArray(lista)) lista = lista && lista.data ? lista.data : (lista || []);

    // Cargar proveedores para mostrar nombre
    const proveedores = await getProveedores().catch(() => []);

    // Búsqueda
    if (debouncedSearch) {
      lista = (lista || []).filter(m => (m.nombre || '').toLowerCase().includes(debouncedSearch.toLowerCase()));
    }

    // Ordenamiento
    if (sortBy === 'nombre') {
      lista.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
    } else if (sortBy === '-nombre') {
      lista.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || ''));
    }

    // Enriquecer con nombre de proveedor si aplica
    const provMap = (proveedores || []).reduce((acc, p) => { acc[String(p.id)] = p; return acc; }, {});
    const enriched = (lista || []).map(m => ({ ...m, proveedorNombre: provMap[String(m.proveedorId)]?.nombre || '' }));
    setMarcas(enriched);
  };

  return (
    <div className="container my-4">
      <form className="row mb-4" onSubmit={(e) => e.preventDefault()}>
        <div className="col-md-3">
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'productos') navigate('/productos');
              else if (val === 'categorias') navigate('/categorias');
              else setSortBy(val);
            }}
          >
            <option value="">Ir a...</option>
            <option value="productos">Productos</option>
            <option value="categorias">Categorías</option>
            <optgroup label="Ordenar marcas">
              <option value="nombre">Nombre (A-Z)</option>
              <option value="-nombre">Nombre (Z-A)</option>
            </optgroup>
          </select>
        </div>
        <div className="col-md-7">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar marcas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={() => {
              setSearchQuery('');
              setSortBy('');
            }}
          >
            <i className="fas fa-eraser me-1"></i>Limpiar
          </button>
        </div>
      </form>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Catálogo de Marcas</h2>
      </div>

      {marcas.length === 0 ? (
        <div className="alert alert-info text-center">No hay marcas disponibles.</div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {marcas.map((marca) => (
            <div key={marca.id} className="col">
              <div
                className="card h-100 shadow-sm text-center"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/productos/por-marca/${marca.id}`)}
              >
                <div className="card-body">
                  {marca.logoUrl ? (
                    <img src={marca.logoUrl} className="img-fluid mb-3" alt={marca.nombre} style={{ maxHeight: '120px', objectFit: 'contain' }} />
                  ) : (
                    <i className="fas fa-industry fa-3x text-primary mb-3"></i>
                  )}
                  <h5 className="card-title">{marca.nombre}</h5>
                  <p className="card-text text-muted small">{marca.descripcion}</p>
                  {marca.proveedorId && (
                    <p className="small text-muted mb-2">Proveedor: {marca.proveedorNombre || 'N/D'}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarcasList;