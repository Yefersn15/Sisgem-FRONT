// src/services/api/configuracion.api.js
import { request } from './client';

export const getConfiguracion = async () => request('/api/configuracion');

export const updateConfiguracion = async (data) => request('/api/configuracion', { method: 'PUT', body: data });
