import { createContext, useContext, useState, useCallback } from 'react';

const AyudaContext = createContext(null);

// Botón de ayuda flotante, presente en toda la app. Cada página registra su
// propio texto al montarse (ver hooks/useAyudaPagina.js); este provider solo
// guarda ese texto y dibuja el botón + panel, sin saber nada de páginas.
export const AyudaProvider = ({ children }) => {
  const [ayuda, setAyuda] = useState(null);
  const [abierto, setAbierto] = useState(false);

  const setAyudaPagina = useCallback((nuevaAyuda) => {
    setAyuda(nuevaAyuda);
    if (!nuevaAyuda) setAbierto(false);
  }, []);

  return (
    <AyudaContext.Provider value={{ setAyudaPagina }}>
      {children}
      {ayuda && (
        <button
          type="button"
          className="btn btn-primary rounded-circle shadow d-flex align-items-center justify-content-center"
          style={{ position: 'fixed', bottom: 24, right: 24, width: 52, height: 52, zIndex: 1040 }}
          onClick={() => setAbierto(true)}
          title="Ayuda de esta página"
        >
          <i className="fas fa-question fa-lg"></i>
        </button>
      )}
      {ayuda && abierto && (
        <>
          <div className="offcanvas offcanvas-end show" tabIndex="-1" style={{ visibility: 'visible', zIndex: 1050 }}>
            <div className="offcanvas-header border-bottom">
              <h5 className="offcanvas-title">{ayuda.titulo}</h5>
              <button type="button" className="btn-close" onClick={() => setAbierto(false)}></button>
            </div>
            <div className="offcanvas-body">{ayuda.contenido}</div>
          </div>
          <div className="offcanvas-backdrop fade show" onClick={() => setAbierto(false)}></div>
        </>
      )}
    </AyudaContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- hook co-ubicado a propósito con su Provider
export const useAyuda = () => useContext(AyudaContext);
