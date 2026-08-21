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

  const res = await fetch(url, opts);

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
    // No borrar token automáticamente en 401/400 - el usuario puede re-autenticarse si es necesario
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
