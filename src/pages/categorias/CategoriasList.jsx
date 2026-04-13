import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDebounce from '../../hooks/useDebounce';
import { getCategorias } from '../../services/dataService';

const CategoriasList = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 500);
  useEffect(() => {
    const init = async () => {
      await cargarCategorias();
    };
    init();
  }, [debouncedSearch, sortBy]);

  const cargarCategorias = async () => {
    let lista = await getCategorias();
    if (!Array.isArray(lista)) lista = lista && lista.data ? lista.data : (lista || []);

    // Búsqueda
    if (debouncedSearch) {
      lista = (lista || []).filter(c => (c.nombre || '').toLowerCase().includes(debouncedSearch.toLowerCase()));
    }

    // Ordenamiento
    if (sortBy === 'nombre') {
      lista.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
    } else if (sortBy === '-nombre') {
      lista.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || ''));
    }

    setCategorias(lista);
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
              else if (val === 'marcas') navigate('/marcas');
              else setSortBy(val);
            }}
          >
            <option value="">Ir a...</option>
            <option value="productos">Productos</option>
            <option value="marcas">Marcas</option>
            <optgroup label="Ordenar categorías">
              <option value="nombre">Nombre (A-Z)</option>
              <option value="-nombre">Nombre (Z-A)</option>
            </optgroup>
          </select>
        </div>
        <div className="col-md-7">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar categorías..."
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
        <h2>Catálogo de Categorías</h2>
      </div>

      {categorias.length === 0 ? (
        <div className="alert alert-info text-center">No hay categorías disponibles.</div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {categorias.map((cat) => (
            <div key={cat.id} className="col">
              <div
                className="card h-100 shadow-sm text-center"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/productos/por-categoria/${cat.id}`)}
              >
                <div className="card-body">
                  <i className="fas fa-tags fa-3x text-primary mb-3"></i>
                  <h5 className="card-title">{cat.nombre}</h5>
                  <p className="card-text text-muted small">{cat.descripcion || 'Sin descripción'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriasList;