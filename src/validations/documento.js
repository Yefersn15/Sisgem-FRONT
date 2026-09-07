// src/validations/documento.js
// CC/CE/NIT son solo dígitos; el pasaporte admite letras y números.
export const documentoEsValido = (documento, tipoDocumento = 'CC') => {
  const value = (documento || '').trim();
  if (!value) return false;
  if (tipoDocumento === 'PAS') return /^[A-Za-z0-9]{5,15}$/.test(value);
  return /^\d{6,12}$/.test(value);
};

export const mensajeDocumentoInvalido = (tipoDocumento = 'CC') =>
  tipoDocumento === 'PAS'
    ? 'Debe tener entre 5 y 15 caracteres alfanuméricos'
    : 'Debe contener solo números (6 a 12 dígitos)';
