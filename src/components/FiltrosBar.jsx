// src/components/FiltrosBar.jsx
// Barra de búsqueda/filtros estándar de las páginas de administración. Antes
// cada página (Productos, Marcas, Categorías, Usuarios, Ventas, Pedidos,
// Pagos, Domicilios) definía su propia grilla desde cero: distinto reparto
// de columnas (col-md-2 en unas, col-md-5/6 en otras), distinto orden de
// controles (unas ponían el buscador primero, otras al final) y hasta un
// botón "Limpiar" con clase distinta (btn-secondary vs btn-outline-secondary)
// sin ningún motivo funcional — solo porque cada una se escribió por
// separado. Este componente unifica el contenedor, la grilla y el botón
// "Limpiar"; cada página sigue siendo dueña de su propio input/select (se
// pasan como children, ya envueltos en su columna) y de su propia lógica de
// estado — el orden esperado de los children es buscador → selects de
// filtro → select de orden, para que la barra se lea igual en todas partes.
const FiltrosBar = ({ children, onClear }) => (
  <div className="card mb-4">
    <div className="card-body">
      <div className="row g-3">
        {children}
        <div className="col-6 col-md-auto">
          <button type="button" className="btn btn-outline-secondary w-100" onClick={onClear}>
            <i className="fas fa-eraser me-1"></i>Limpiar
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default FiltrosBar;
