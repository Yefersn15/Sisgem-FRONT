// src/services/api/auth.api.js
import { request } from './client';

export const loginUser = async (email, password) => {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: { email, password }
  });
  return data;
};

export const registerUser = async (userData) => {
  const data = await request('/api/auth/register', {
    method: 'POST',
    body: userData
  });
  return data;
};

export const getCurrentUser = async () => {
  const data = await request('/api/auth/me');
  return data;
};

export const forgotPassword = async (email) => {
  const data = await request('/api/auth/forgot-password', {
    method: 'POST',
    body: { email }
  });
  return data;
};

export const resetPassword = async (token, password) => {
  const data = await request('/api/auth/reset-password', {
    method: 'POST',
    body: { token, password }
  });
  return data;
};

// Cambio de contraseña (usuario autenticado, endpoint dedicado)
export const changePassword = async (currentPassword, newPassword) => {
  const data = await request('/api/auth/change-password', {
    method: 'POST',
    body: { currentPassword, password: newPassword }
  });
  return data;
};

// NOTA: placeholder no utilizado en el flujo real de cambio de contraseña; se
// preserva tal cual estaba en el archivo original para no alterar comportamiento.
export const hashPassword = async (password) => {
  return password;
};
