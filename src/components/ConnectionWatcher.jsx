// src/components/ConnectionWatcher.jsx
// Reacciona a los dos eventos que client.js emite y que ninguna pantalla
// puede resolver por sí sola: (1) el backend dejó de responder con
// normalidad (caído, saturado, red del usuario) - se avisa con una barra de
// "reconectando" y se reintenta en segundo plano hasta que vuelva; (2) el
// token dejó de servir (expiró o fue invalidado) - se cierra la sesión de
// forma obligatoria y se manda al login. Vive dentro de <BrowserRouter> (a
// diferencia de client.js, que no puede depender de React Router) para
// poder navegar desde cualquier pantalla, sin importar cuál haya sido la
// primera en notar el problema.
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onConnectionEvent, pingApi, getUltimaCausaPerdida } from '../services/api/client';

// Un 429 se libera solo cuando pasa la ventana del límite (minutos), así que
// revisarlo cada 5s solo genera tráfico de sobra sin acelerar nada; una
// caída de red o un 5xx sí puede resolverse en segundos y conviene revisar
// seguido. pingApi() golpea una ruta que no pasa por el limitador, pero aun
// así no tiene sentido insistir tan seguido cuando no va a cambiar pronto.
const REINTENTO_MS_RED = 5000;
const REINTENTO_MS_LIMITE = 45000;

const ConnectionWatcher = () => {
  const [reconectando, setReconectando] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const pollRef = useRef(null);
  const locationRef = useRef(location);
  locationRef.current = location;

  useEffect(() => {
    const detenerPolling = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    const unsubscribe = onConnectionEvent((event) => {
      if (event === 'lost') {
        setReconectando(true);
        // Se reinicia el intervalo (no solo "crear si no existe"): la causa
        // puede cambiar entre un evento y otro, y el ritmo de reintento debe
        // ajustarse a la causa actual, no quedar fijo con la primera.
        detenerPolling();
        const intervalo = getUltimaCausaPerdida() === 'rate-limited' ? REINTENTO_MS_LIMITE : REINTENTO_MS_RED;
        pollRef.current = setInterval(pingApi, intervalo);
      } else if (event === 'restored') {
        setReconectando(false);
        detenerPolling();
      } else if (event === 'session-expired') {
        if (!locationRef.current.pathname.startsWith('/login')) {
          navigate('/login', { replace: true, state: { sessionExpired: true } });
        }
      }
    });

    return () => {
      unsubscribe();
      detenerPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- navigate es estable; se evita re-suscribir en cada cambio de ruta
  }, []);

  if (!reconectando) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="d-flex align-items-center justify-content-center gap-2 text-center"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2100,
        padding: '10px 16px',
        background: 'var(--warning, #f0ad4e)',
        color: '#1a1a1a',
        fontSize: '0.9rem',
        fontWeight: 500,
        boxShadow: 'var(--shadow-lg, 0 2px 8px rgba(0,0,0,.15))',
      }}
    >
      <i className="fas fa-rotate fa-spin"></i>
      <span>Reconectando con el servidor. Esto puede tardar unos segundos, por favor espera…</span>
    </div>
  );
};

export default ConnectionWatcher;
