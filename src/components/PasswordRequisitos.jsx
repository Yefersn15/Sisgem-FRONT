import { REQUISITOS_PASSWORD } from '../validations/password';

// Checklist en vivo: cada requisito se marca en verde apenas se cumple,
// mientras la persona sigue escribiendo (no hay que esperar a enviar el formulario).
const PasswordRequisitos = ({ password }) => (
  <ul className="list-unstyled small mb-0 mt-1">
    {REQUISITOS_PASSWORD.map((req) => {
      const cumplido = req.test(password);
      return (
        <li key={req.clave} className={cumplido ? 'text-success' : 'text-muted'}>
          <i className={`fas ${cumplido ? 'fa-check' : 'fa-circle'} me-2`} style={!cumplido ? { fontSize: 5, verticalAlign: 'middle' } : undefined}></i>
          {req.label}
        </li>
      );
    })}
  </ul>
);

export default PasswordRequisitos;
