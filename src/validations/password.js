// src/validations/password.js
// Regla compartida por todo lo que establece una contraseña (registro,
// restablecer por enlace, cambiar contraseña, crear/editar usuario desde
// admin): al menos 1 mayúscula, 1 minúscula, 1 número, 1 símbolo y 8+ caracteres.
export const REQUISITOS_PASSWORD = [
  { clave: 'longitud', label: 'Mínimo 8 caracteres', test: (v) => v.length >= 8 },
  { clave: 'mayuscula', label: 'Una mayúscula', test: (v) => /[A-Z]/.test(v) },
  { clave: 'minuscula', label: 'Una minúscula', test: (v) => /[a-z]/.test(v) },
  { clave: 'numero', label: 'Un número', test: (v) => /\d/.test(v) },
  { clave: 'simbolo', label: 'Un símbolo o carácter especial', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export const passwordEsValida = (v) => REQUISITOS_PASSWORD.every((r) => r.test(v));
