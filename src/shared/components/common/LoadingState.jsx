// src/shared/components/common/LoadingState.jsx
// Estado de carga estándar: mismo spinner-border ya usado en varias
// pantallas, en vez de texto plano "Cargando..." sin estilo.
const LoadingState = ({ label = 'Cargando...', className = '' }) => (
  <div className={`text-center py-5 ${className}`}>
    <div className="spinner-border" role="status">
      <span className="visually-hidden">{label}</span>
    </div>
    <p className="text-muted mt-3 mb-0">{label}</p>
  </div>
);

export default LoadingState;
