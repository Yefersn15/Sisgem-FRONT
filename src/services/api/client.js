// src/services/api/client.js
// Cliente HTTP base para la API REST de SISGEM. No usa localStorage para datos,
// solo para el token de sesión.

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:3000';
  }
  return 'https://sisgem-api.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();
export const USE_REMOTE_API = import.meta.env.VITE_USE_REMOTE_API === 'true';

export const getAuthToken = () => {
  try {
    return localStorage.getItem('auth_token');
  } catch (e) {
    return null;
  }
};

const clearSession = () => {
  try {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  } catch {
    // localStorage no disponible (modo privado, etc.) - nada que limpiar
  }
};

// Bus de eventos mínimo para que módulos sin React (este archivo) avisen a
// componentes de la UI (ConnectionWatcher) sobre el estado de la conexión y
// sesiones expiradas, sin que client.js dependa de React ni del router.
const connectionListeners = new Set();
export const onConnectionEvent = (callback) => {
  connectionListeners.add(callback);
  return () => connectionListeners.delete(callback);
};
const emitConnectionEvent = (event) => connectionListeners.forEach((cb) => cb(event));

// 'ok' | 'lost': evita reemitir el mismo estado en cada request mientras la
// caída persiste (para que el componente no reinicie su lógica de aviso).
let connectionState = 'ok';
// El ping de recuperación (pingApi) golpea la raíz pública de la API, que a
// propósito NO pasa por el limitador de solicitudes (ver app.js) para no
// empeorar un 429 real reintentando contra él. Eso significa que un ping
// exitoso demuestra que el servidor está vivo, pero NO que el límite de
// solicitudes ya se liberó — así que solo se usa para "levantar" el aviso
// cuando la causa fue una caída real (red/servidor), nunca cuando fue un 429:
// esa sola la limpia una solicitud real de la API que vuelva a tener éxito.
let ultimaCausaPerdida = null; // 'network' | 'server-error' | 'rate-limited'
// Para que ConnectionWatcher pueda espaciar su reintento en segundo plano
// según la causa (un 429 se libera en minutos, no tiene sentido revisar
// cada pocos segundos; una caída de red sí conviene revisarla seguido).
export const getUltimaCausaPerdida = () => ultimaCausaPerdida;
const reportConnectionOk = () => {
  if (connectionState !== 'ok') {
    connectionState = 'ok';
    ultimaCausaPerdida = null;
    emitConnectionEvent('restored');
  }
};
const reportConnectionLost = (causa) => {
  ultimaCausaPerdida = causa;
  if (connectionState !== 'lost') {
    connectionState = 'lost';
    emitConnectionEvent('lost');
  }
};

export const request = async (path, options = {}) => {
  const url = path.startsWith('http') ? path : `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

  const isFormData = options.body instanceof FormData;
  const headers = {
    // Con FormData el navegador debe fijar su propio Content-Type (con boundary)
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const opts = {
    ...options,
    headers
  };

  if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
    opts.body = JSON.stringify(opts.body);
  }

  let res;
  try {
    res = await fetch(url, opts);
  } catch {
    // El fetch nunca llegó a obtener respuesta (servidor caído, sin
    // internet, CORS, timeout de Render al "despertar" el servicio, etc.):
    // esto sí es "se perdió la conexión", a diferencia de un 429/5xx (el
    // servidor respondió, solo que con un error).
    reportConnectionLost('network');
    throw new Error('No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.');
  }

  // Un 401 significa que el token no existe/es inválido/expiró (verifyToken
  // lo rechazó): si creíamos tener sesión, se fuerza el cierre y se manda al
  // login. Se hace aquí y no en cada pantalla porque cualquier llamada,
  // desde cualquier página, puede ser la primera en descubrir que el token
  // ya no sirve.
  if (res.status === 401 && getAuthToken()) {
    clearSession();
    emitConnectionEvent('session-expired');
  }

  // 429 (límite de solicitudes) y 5xx (error del servidor) sí implican que
  // el servidor respondió, pero la app no puede operar con normalidad —
  // se trata igual que una desconexión para mostrarle al usuario un aviso
  // en vez de dejar que cada pantalla falle en silencio o con un error
  // técnico suelto.
  if (res.status === 429 || res.status >= 500) {
    reportConnectionLost(res.status === 429 ? 'rate-limited' : 'server-error');
  } else {
    reportConnectionOk();
  }

  if (!res.ok) {
    let txt = '';
    try {
      txt = await res.text();
    } catch (e) {
      txt = 'No se pudo leer el cuerpo de la respuesta';
    }
    // La API responde { success: false, message } en JSON; si se puede parsear,
    // usamos ese mensaje en vez del texto crudo para mostrar errores legibles.
    let message = txt;
    try {
      const parsed = JSON.parse(txt);
      if (parsed && parsed.message) message = parsed.message;
    } catch {
      // txt no era JSON, se deja tal cual
    }
    const err = new Error(message || `Error ${res.status} ${res.statusText}`);
    err.status = res.status;
    throw err;
  }

  let text = '';
  try {
    text = await res.text();
  } catch (e) {
    throw new Error('No se pudo leer la respuesta del servidor');
  }
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  // La API retorna { success: true, message, data }
  if (data && data.success !== undefined) {
    if (!data.success) {
      const err = new Error(data.message || 'Error en la API');
      err.status = res.status;
      throw err;
    }
    return data.data; // Retornamos solo data
  }

  return data;
};

// Ping liviano para el aviso de "reconectando": la raíz de la API ("/", no
// "/api/...") no pasa por el rate limiter general, así que reintentar contra
// ella mientras el backend está caído/saturado no empeora el problema. Pero
// por eso mismo un ping exitoso NO demuestra que un 429 ya se liberó (ver
// ultimaCausaPerdida) — en ese caso el aviso se deja como está y solo lo
// levanta una solicitud real de la API que vuelva a tener éxito.
export const pingApi = async () => {
  try {
    const res = await fetch(API_BASE_URL);
    if (res.ok) {
      if (ultimaCausaPerdida !== 'rate-limited') reportConnectionOk();
      return true;
    }
    return false;
  } catch {
    return false;
  }
};
