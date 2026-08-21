// src/services/api/utils.js
// Utilidades compartidas entre módulos de dominio: formateo y exportación a Excel.
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const formatPrice = (value, options = {}) => {
  const v = Math.round(Number(value) || 0);
  const withSymbol = options.withSymbol !== false;
  const s = v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return withSymbol ? `$${s}` : s;
};

export const parseBooleanCell = (val) => {
  if (val === undefined || val === null) return false;
  const s = String(val).trim().toLowerCase();
  return ['sí', 'si', 'true', 'verdadero', '1', 'yes', 'activo'].includes(s);
};

export const parseDateCellToISO = (val) => {
  if (!val) return new Date().toISOString();
  if (val instanceof Date) return val.toISOString();
  const s = String(val).trim();
  const normalized = s.replace(',', ' ').replace(/\s+/g, ' ').trim();
  const parsed = Date.parse(normalized);
  if (!isNaN(parsed)) return new Date(parsed).toISOString();
  const match = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[\sT,](\d{1,2}):(\d{1,2}))?/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    const hour = match[4] ? parseInt(match[4], 10) : 0;
    const minute = match[5] ? parseInt(match[5], 10) : 0;
    return new Date(year, month, day, hour, minute).toISOString();
  }
  return new Date().toISOString();
};

export const formatDateForExport = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return iso;
  }
};

export const exportToExcel = (data, filename = 'datos.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, filename);
};
