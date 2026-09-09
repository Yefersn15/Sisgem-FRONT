// src/services/api/usuarios.api.js
import * as XLSX from 'xlsx';
import { request } from './client';
import { exportToExcel } from './utils';

export const getUsuarios = async () => {
  try {
    const data = await request('/api/usuarios');
    return Array.isArray(data) ? data.map(u => ({
      id: u.documento || u.id || u._id,
      documento: u.documento,
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      telefono: u.telefono,
      tipoVehiculo: u.tipoVehiculo || u.tipo_vehiculo || '',
      placa: u.placa || '',
      rol: u.rol ? { id: u.rol.id, nombre: u.rol.nombre } : (u.rolId ? { id: u.rolId } : null),
      rol_id: u.rol?.id || u.rolId,
      rol_nombre: u.rol?.nombre,
      estado: u.estado,
      fecha_creacion: u.createdAt
    })) : [];
  } catch (e) {
    console.error('Error obteniendo usuarios:', e);
    return [];
  }
};

export const getUsuarioById = async (id) => {
  const data = await request(`/api/usuarios/${id}`);
  return data;
};

export const createUsuario = async (usuario) => {
  const data = await request('/api/usuarios', { method: 'POST', body: usuario });
  return data;
};

export const updateUsuario = async (id, usuario) => {
  const data = await request(`/api/usuarios/${id}`, { method: 'PUT', body: usuario });
  return data;
};

export const deleteUsuario = async (id) => {
  await request(`/api/usuarios/${id}`, { method: 'DELETE' });
};

export const toggleUsuarioEstado = async (id, nuevoEstado) => {
  return await request(`/api/usuarios/${id}/estado`, {
    method: 'PATCH',
    body: { estado: nuevoEstado }
  });
};

export const exportUsuarios = async () => {
  const usuarios = await getUsuarios();
  const data = usuarios.map(u => ({
    Id: u.id,
    Nombre: u.nombre,
    Apellido: u.apellido,
    Email: u.email,
    Telefono: u.telefono,
    Documento: u.documento,
    Estado: u.estado,
  }));
  exportToExcel(data, 'usuarios.xlsx');
};

export const importUsuarios = async (file, onSuccess, onError) => {
  try {
    const data = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(data, { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    for (const row of rows) {
      const nombre = row.Nombre || row.nombre || '';
      const email = row.Email || row.email || '';
      const password = row.Password || row.password || 'password123';
      if (nombre && email) {
        await createUsuario({ nombre, email, password });
      }
    }
    onSuccess && onSuccess(rows.length);
  } catch (err) {
    onError && onError(err);
  }
};

// ----------------------------------------------------------------------
// DIRECCIONES DEL USUARIO
// ----------------------------------------------------------------------
export const getDirecciones = async () => {
  try {
    const data = await request('/api/usuarios/direcciones');
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Error obteniendo direcciones:', e);
    return [];
  }
};

export const createDireccion = async (direccion) => {
  const data = await request('/api/usuarios/direcciones', { method: 'POST', body: direccion });
  return data;
};

export const updateDireccion = async (id, direccion) => {
  const data = await request(`/api/usuarios/direcciones/${id}`, { method: 'PUT', body: direccion });
  return data;
};

export const deleteDireccion = async (id) => {
  await request(`/api/usuarios/direcciones/${id}`, { method: 'DELETE' });
};
