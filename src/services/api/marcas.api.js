// src/services/api/marcas.api.js
import * as XLSX from 'xlsx';
import { request, API_BASE_URL, getAuthToken } from './client';
import { parseBooleanCell } from './utils';

// Marca: Frontend -> API
const mapMarcaToApi = (m) => ({
  nombre: m.nombre,
  descripcion: m.descripcion,
  logo: m.logoUrl,
  sitio_web: m.sitioWeb,
  estado: m.activo !== undefined ? m.activo : true
});

// Marca: API -> Frontend
const mapApiToMarca = (api) => ({
  id: api.id,
  nombre: api.nombre,
  descripcion: api.descripcion,
  logoUrl: api.logo || api.logo_data,
  sitioWeb: api.sitio_web || '',
  activa: api.estado !== false
});

export const getMarcas = async () => {
  try {
    const data = await request('/api/marcas');
    return Array.isArray(data) ? data.map(mapApiToMarca) : [];
  } catch (e) {
    console.error('Error obteniendo marcas:', e);
    return [];
  }
};

export const getMarcaById = async (id) => {
  const data = await request(`/api/marcas/${id}`);
  return mapApiToMarca(data);
};

export const createMarca = async (marca) => {
  const payload = mapMarcaToApi(marca);
  const data = await request('/api/marcas', { method: 'POST', body: payload });
  return mapApiToMarca(data);
};

export const updateMarca = async (id, marca) => {
  const payload = mapMarcaToApi(marca);
  const data = await request(`/api/marcas/${id}`, { method: 'PUT', body: payload });
  return mapApiToMarca(data);
};

export const deleteMarca = async (id) => {
  await request(`/api/marcas/${id}`, { method: 'DELETE' });
};

export const toggleMarcaEstado = async (id) => {
  const marca = await getMarcaById(id);
  if (marca) {
    return await request(`/api/marcas/${id}/estado`, {
      method: 'PATCH',
      body: { estado: !marca.activo }
    });
  }
  return null;
};

export const exportMarcas = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/marcas/export`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'marcas.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error exportando marcas:', err);
  }
};

export const importMarcas = async (file, onSuccess, onError) => {
  try {
    const data = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(data, { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    for (const row of rows) {
      // Campos del Excel: Id, Nombre, Descripcion, LogoUrl, Activo, SitioWeb
      const nombre = row.Nombre || row.nombre || '';
      const descripcion = row.Descripcion || row.descripcion || '';
      const logoUrl = row.LogoUrl || row.logoUrl || row.Logo || row.logo || row.Imagen || row.imagen || '';
      const sitioWeb = row.SitioWeb || row.sitioWeb || '';
      const activo = parseBooleanCell(row.Activo || row.activo);
      if (nombre) {
        await createMarca({ nombre, descripcion, logoUrl, sitioWeb, activo });
      }
    }
    onSuccess && onSuccess(rows.length);
  } catch (err) {
    onError && onError(err);
  }
};
