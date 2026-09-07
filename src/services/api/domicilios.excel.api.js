// src/services/api/domicilios.excel.api.js
// Importación/exportación de domicilios en Excel. Separado de domicilios.api.js
// porque es un flujo de archivo autocontenido, no gestión del domicilio en sí.
import * as XLSX from 'xlsx';
import { exportToExcel } from './utils';
import { createDireccion } from './usuarios.api';
import { getDomicilios } from './domicilios.api';

export const importDomicilios = async (file, onSuccess, onError) => {
  try {
    const data = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(data, { type: 'array' });
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    for (const row of rows) {
      const direccion = row.Direccion || row.direccion || '';
      const ciudad = row.Ciudad || row.ciudad || '';
      const telefono = row.Telefono || row.telefono || '';
      if (direccion && ciudad) {
        await createDireccion({ direccion, ciudad, telefono });
      }
    }
    onSuccess && onSuccess(rows.length);
  } catch (err) {
    onError && onError(err);
  }
};

export const exportDomicilios = async () => {
  const domicilios = await getDomicilios();
  const data = domicilios.map(d => ({
    Id: d.id,
    Direccion: d.direccion,
    Ciudad: d.ciudad,
    Telefono: d.telefono,
    Estado: d.estado,
  }));
  exportToExcel(data, 'domicilios.xlsx');
};
