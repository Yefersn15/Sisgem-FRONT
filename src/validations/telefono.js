// src/validations/telefono.js
export const telefonoEsValido = (telefono) => /^\d{10}$/.test((telefono || '').replace(/\D/g, ''));

export const MENSAJE_TELEFONO_INVALIDO = 'Debe tener 10 dígitos';
