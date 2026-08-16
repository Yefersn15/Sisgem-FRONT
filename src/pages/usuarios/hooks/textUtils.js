// src/pages/usuarios/hooks/textUtils.js
const DIACRITICS = new RegExp('[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']', 'g');

export const normalizeText = (text) => {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(/\s+/g, ' ')
    .trim();
};
