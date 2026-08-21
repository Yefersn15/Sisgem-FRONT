// src/services/api/categorias.api.js
import * as XLSX from 'xlsx';
import { request, API_BASE_URL, getAuthToken } from './client';
import { parseBooleanCell } from './utils';

// Categoría: Frontend -> API
const mapCategoriaToApi = (c) => ({
  nombre: c.nombre,
  descripcion: c.descripcion,
  estado: c.activa !== undefined ? c.activa : true
});

// Categoría: API -> Frontend
const mapApiToCategoria = (api) => ({
  id: api.id,
  nombre: api.nombre,
  descripcion: api.descripcion,
  activo: api.estado
});

export const getCategorias = async () => {
  const data = await request('/api/categorias');
  return Array.isArray(data) ? data.map(mapApiToCategoria) : [];
};

export const getCategoriaById = async (id) => {
  const data = await request(`/api/categorias/${id}`);
  return mapApiToCategoria(data);
};

export const createCategoria = async (categoria) => {
  const payload = mapCategoriaToApi(categoria);
  const data = await request('/api/categorias', { method: 'POST', body: payload });
  return mapApiToCategoria(data);
};

export const updateCategoria = async (id, categoria) => {
  const payload = mapCategoriaToApi(categoria);
  const data = await request(`/api/categorias/${id}`, { method: 'PUT', body: payload });
  return mapApiToCategoria(data);
};

export const deleteCategoria = async (id) => {
  await request(`/api/categorias/${id}`, { method: 'DELETE' });
};

export const toggleCategoriaEstado = async (id) => {
  const categoria = await getCategoriaById(id);
  if (categoria) {
    return await request(`/api/categorias/${id}/estado`, {
      method: 'PATCH',
      body: { estado: !categoria.activo }
    });
  }
  return null;
};

export const exportCategorias = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categorias/export`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'categorias.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error exportando categorías:', err);
  }
};

export const importCategorias = async (file, onSuccess, onError) => {
  try {
    const data = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(data, { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    for (const row of rows) {
      const nombre = row.Nombre || row.nombre || '';
      const descripcion = row.Descripcion || row.descripcion || '';
      const activo = parseBooleanCell(row.Activo || row.activo);
      if (nombre) {
        await createCategoria({ nombre, descripcion, activo });
      }
    }
    onSuccess && onSuccess(rows.length);
  } catch (err) {
    onError && onError(err);
    console.error('Error importando categorías:', err);
  }
};
