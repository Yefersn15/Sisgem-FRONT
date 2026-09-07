// src/validations/email.js
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailEsValido = (email) => EMAIL_REGEX.test((email || '').trim());

export const MENSAJE_EMAIL_INVALIDO = 'Ingresa un correo electrónico válido';
