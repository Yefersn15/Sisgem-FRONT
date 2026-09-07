// src/pages/home/components/HomeSearchBar.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomeSearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const term = query.trim();
    navigate(term ? `/productos?q=${encodeURIComponent(term)}` : '/productos');
  };

  return (
    <div className="mb-5">
      <form
        onSubmit={handleSubmit}
        className="d-flex w-100 home-search-bar"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 999,
          boxShadow: 'var(--shadow)',
          padding: 6,
          gap: 6,
        }}
      >
        <div className="d-flex align-items-center flex-grow-1" style={{ paddingLeft: 14 }}>
          <i className="fas fa-search" style={{ color: 'var(--text-muted)' }}></i>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca productos, marcas o categorías..."
            aria-label="Buscar productos"
            className="home-search-input"
            style={{
              border: 'none',
              background: 'transparent',
              padding: '10px 12px',
              width: '100%',
            }}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ borderRadius: 999, padding: '10px 24px', flexShrink: 0 }}
        >
          Buscar
        </button>
      </form>
    </div>
  );
};

export default HomeSearchBar;
