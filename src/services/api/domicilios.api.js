// src/services/api/domicilios.api.js
import * as XLSX from 'xlsx';
import { request } from './client';
import { exportToExcel } from './utils';
import { createDireccion } from './usuarios.api';

export const getDomicilios = async () => {
  try {
    // Obtener domicilios reales y complementar con pedidos de tipo 'domicilio' que aún no tienen domicilio creado
    const domiciliosData = await request('/api/domicilios');
    const pedidosData = await request('/api/pedidos');

    const domicilios = Array.isArray(domiciliosData) ? domiciliosData.map(dom => {
      // normalizar id de pedido
      const pedidoId = dom.pedido?.id || dom.pedido || dom.pedidoId || null;

      // normalizar repartidor (puede ser string o objeto)
      let repartidorObj = null;
      if (dom.repartidor) {
        if (typeof dom.repartidor === 'object') {
          repartidorObj = {
            nombre: dom.repartidor.nombre || dom.repartidor.nombreCompleto || dom.repartidor,
            telefono: dom.repartidor.telefono || dom.repartidor.phone || dom.telefono_repartidor || '',
            tipoVehiculo: dom.repartidor.tipoVehiculo || dom.tipoVehiculo || '',
            placa: dom.repartidor.placa || dom.placa || ''
          };
        } else {
          repartidorObj = { nombre: dom.repartidor, telefono: dom.telefono_repartidor || '', tipoVehiculo: dom.tipoVehiculo || '', placa: dom.placa || '' };
        }
      }

      const domDir = dom.direccion ? (typeof dom.direccion === 'object' ? dom.direccion : { direccion: dom.direccion, direccion2: dom.direccion2, barrio: dom.barrio }) : { direccion: '', direccion2: '', barrio: '' };
    const pedidoDir = dom.pedido?.direccion ? (typeof dom.pedido.direccion === 'object' ? dom.pedido.direccion : { tipo: '' }) : { direccion: '', tipo: '' };
    const resTipo = domDir.tipo || pedidoDir.tipo || '';
    const pedidoEstado = dom.pedido?.estado_pedido || dom.pedido?.estadoPedido || 'pendiente';
    const pedidoMetodo = dom.pedido?.metodo_pago || dom.pedido?.metodoPago || 'Efectivo';
    const pedidoUsuario = dom.pedido?.usuario?.nombre || dom.pedido?.usuarioNombre || '';

    return ({
        id: dom.id,
        pedidoId: pedidoId,
        ventaId: pedidoId,
        direccion: dom.direccion || domDir.direccion || '',
        direccion2: dom.direccion2 || domDir.direccion2 || '',
        barrio: dom.barrio || domDir.barrio || '',
        ciudad: dom.ciudad || '',
        telefono: dom.telefono || '',
        estado: dom.estado || 'Pendiente',
        tipo: resTipo,
        tarifa: (dom.tarifaAplicada ?? dom.tarifa_aplicada ?? dom.tarifa) ?? 0,
        repartidor: repartidorObj,
        notas: dom.notas || '',
        venta: {
          id: dom.pedido?.id,
          estadoPedido: pedidoEstado,
          metodoPago: pedidoMetodo,
          usuarioNombre: pedidoUsuario,
          direccion: dom.pedido?.direccion,
          telefono: dom.pedido?.telefono_contacto
        }
      });
    }) : [];

    const pedidos = Array.isArray(pedidosData) ? pedidosData : [];

    // Añadir pedidos de tipo domicilio que no tengan Domicilio creado
    const pedidosDomicilio = pedidos
      .filter(p => p.tipo_venta === 'domicilio')
      .filter(p => !domicilios.find(d => String(d.pedidoId) === String(p.id)))
      .map(p => {
        const direccionStr = (typeof p.direccion === 'string') ? p.direccion : (p.direccion && typeof p.direccion === 'object' ? (p.direccion.direccion || '') : '');
        const barrioStr = (p.direccion && typeof p.direccion === 'object') ? (p.direccion.barrio || '') : '';
        const ciudadStr = (p.direccion && typeof p.direccion === 'object') ? (p.direccion.ciudad || '') : '';
        const telefonoStr = p.telefono_contacto || (p.direccion && p.direccion.telefono) || '';
        const tipoStr = (p.direccion && typeof p.direccion === 'object') ? (p.direccion.tipo || '') : '';
        return ({
          id: `pedido-${p.id}`,
          pedidoId: p.id,
          ventaId: p.id,
          direccion: direccionStr,
          direccion2: (p.direccion && typeof p.direccion === 'object') ? (p.direccion.direccion2 || '') : '',
          barrio: barrioStr,
          ciudad: ciudadStr,
          telefono: telefonoStr,
          estado: p.estado_pedido || 'Pendiente',
          tipo: tipoStr,
          tarifa: 0,
          repartidor: null,
          notas: p.observaciones || ''
        });
      });

    return [...pedidosDomicilio, ...domicilios];
  } catch (e) {
    console.error('Error obteniendo domicilios:', e);
    return [];
  }
};

export const getDomicilioByVentaId = async (ventaId) => {
  if (ventaId === 'all') {
    const todos = await getDomicilios();
    return todos;
  }
  const domicilios = await getDomicilios();
  return domicilios.find(d => String(d.pedidoId) === String(ventaId) || String(d.ventaId) === String(ventaId));
};

export const updateDomicilioEstado = async (ventaId, estado, forzar = false) => {
  const dom = await getDomicilioByVentaId(ventaId);
  if (dom) {
    const endpoint = forzar ? `/api/domicilios/${dom.id}/convertir` : `/api/domicilios/${dom.id}/estado`;
    return await request(endpoint, { method: 'PATCH', body: { estado, forzar } });
  }
  return null;
};

export const saveDomicilio = async (domicilio) => {
  // Si el domicilio corresponde a un pedido sintético (id con prefijo 'pedido-'),
  // crear el Domicilio en el backend usando el campo ventaId como 'pedido'.
  try {
    // Si el id parece ser un id de pedido (prefijo 'pedido-') o falta,
    // o si por error `id` coincide con `ventaId` (backend devuelve ventaId en lugar de domicilio._id),
    // tratar como creación de Domicilio nuevo.
    const idIsPedidoSynthetic = String(domicilio.id || '').startsWith('pedido-');
    const idEqualsVentaId = domicilio.id && domicilio.ventaId && String(domicilio.id) === String(domicilio.ventaId);
    if (idIsPedidoSynthetic || !domicilio.id || idEqualsVentaId) {
      // crear dirección primero para evitar casteo a ObjectId en servidores que requieren id
      const direccionPayload = {
        nombre: domicilio.nombre || 'Dirección temporal',
        direccion: domicilio.direccion || '',
        ciudad: domicilio.ciudad || domicilio.barrio || '',
        barrio: domicilio.barrio || domicilio.ciudad || '',
        telefono: domicilio.telefono || ''
      };
      let direccionCreada = null;
      try {
        direccionCreada = await createDireccion(direccionPayload);
      } catch (err) {
        // ignore and fallback to sending object (server may accept it)
      }

      const payload = {
        pedido: domicilio.ventaId || (domicilio.pedido || domicilio.id),
        direccion: direccionCreada && direccionCreada._id ? String(direccionCreada._id) : (direccionCreada || {
          direccion: domicilio.direccion || '',
          barrio: domicilio.barrio || '',
          telefono: domicilio.telefono || ''
        }),
        tarifa: (domicilio.tarifaAplicada ?? domicilio.tarifa_aplicada ?? domicilio.tarifa) ?? 0,
        repartidor: domicilio.repartidor?.nombre || (domicilio.repartidor || ''),
        telefono_repartidor: domicilio.repartidor?.telefono || domicilio.telefono || ''
      };
      // Si viene info extra de repartidor existente
      if (domicilio.repartidor?.repartidorId) {
        payload.repartidor_extra = {
          repartidorId: domicilio.repartidor.repartidorId,
          tipoVehiculo: domicilio.repartidor.tipoVehiculo,
          placa: domicilio.repartidor.placa
        };
      }

      return await request('/api/domicilios', { method: 'POST', body: payload });
    }

    // Si ya existe un domicilio real en DB, actualizar tarifa u otros campos
    if (domicilio.id) {
      // Actualizaciones puntuales soportadas por la API:
      // - tarifa -> PATCH /:id/tarifa { tarifa }
      // - repartidor -> usar `asignarRepartidor(ventaId, ...)` o PATCH /:id/repartidor
      // - estado -> PATCH /:id/estado (usado por updateDomicilioEstado)
      // Para campos no soportados por rutas explícitas (ej. observaciones), la API debe ser extendida.

      if (domicilio.tarifa !== undefined) {
        // Intentar actualizar tarifa usando endpoint concreto; si 404, lanzar error informativo
        try {
          return await request(`/api/domicilios/${domicilio.id}/tarifa`, { method: 'PATCH', body: { tarifa: domicilio.tarifa } });
        } catch (err) {
          if (err && err.status === 404) {
            throw new Error('El endpoint /api/domicilios/:id/tarifa no existe en el API. Actualiza el backend para soportar actualización de tarifa.');
          }
          throw err;
        }
      }

      if (domicilio.repartidor) {
        // Si se pasó objeto repartidor completo, usar asignarRepartidor (que gestiona creación/patch)
        try {
          return await asignarRepartidor(domicilio.ventaId || domicilio.pedido || domicilio.id, domicilio.repartidor);
        } catch (err) {
          throw err;
        }
      }

      // Si sólo se quieren guardar observaciones/notas pero no existe ruta, informar al usuario
      if (domicilio.notas !== undefined) {
        throw new Error('El API no proporciona una ruta para actualizar notas/observaciones del domicilio. Añade un endpoint en el backend o usa la acción administrativa correspondiente.');
      }

      // Nada que actualizar con rutas conocidas
      return null;
    }
  } catch (err) {
    throw err;
  }
  return null;
};

export const asignarRepartidor = async (ventaId, repartidorData) => {
  const dom = await getDomicilioByVentaId(ventaId);

  // Normalizar: puede venir {repartidor: {...}, ...} o {nombre, telefono, ...}
  const repObj = repartidorData.repartidor || repartidorData;
  const repId = repartidorData.repartidorId;
  const repTarifa = repartidorData.tarifa;

  if (dom) {
    if (String(dom.id || '').startsWith('pedido-')) {
      const direccionPayload = {
        nombre: repObj.nombre || 'Dirección temporal',
        direccion: dom.direccion || '',
        ciudad: dom.ciudad || dom.barrio || '',
        barrio: dom.barrio || dom.ciudad || '',
        telefono: dom.telefono || ''
      };
      let direccionCreada = null;
      try {
        direccionCreada = await createDireccion(direccionPayload);
      } catch (err) {
        const payloadFallback = {
          pedido: ventaId,
          direccion: {
            direccion: dom.direccion || '',
            barrio: dom.barrio || dom.ciudad || '',
            telefono: dom.telefono || ''
          },
          tarifa: repTarifa !== undefined && repTarifa !== null ? parseFloat(repTarifa) : null,
          repartidor: {
            nombre: repObj.nombre || '',
            telefono: repObj.telefono || '',
            tipoVehiculo: repObj.tipoVehiculo || '',
            placa: repObj.placa || ''
          }
        };
        if (repId) payloadFallback.repartidorId = repId;
        return await request('/api/domicilios', { method: 'POST', body: payloadFallback });
      }

      const payload = {
        pedido: ventaId,
        direccion: direccionCreada && direccionCreada._id ? String(direccionCreada._id) : direccionCreada,
        repartidor: {
          nombre: repObj.nombre || '',
          telefono: repObj.telefono || '',
          tipoVehiculo: repObj.tipoVehiculo || '',
          placa: repObj.placa || ''
        }
      };

      // Incluir la tarifa directamente en el payload si es un número
      if (repTarifa !== undefined && repTarifa !== null && !isNaN(parseFloat(repTarifa))) {
        payload.tarifa = parseFloat(repTarifa);
      }
      if (repId) {
        payload.repartidorId = repId;
      }

      const created = await request('/api/domicilios', { method: 'POST', body: payload });

      // Intentar obtener el ID del domicilio creado
      let domicilioId = null;
      if (created && (created._id || created.id)) {
        domicilioId = String(created._id || created.id);
      }

      // Si la tarifa no se incluyó en el payload o falló, intentar actualizar
      if (repTarifa !== undefined && repTarifa !== null && domicilioId) {
        try {
          await request(`/api/domicilios/${domicilioId}/tarifa`, { method: 'PATCH', body: { tarifa: parseFloat(repTarifa) } });
        } catch (e) {}
      }
      return created;
    }

    try {
      const updated = await request(`/api/domicilios/${dom.id}/repartidor`, {
        method: 'PATCH',
        body: {
          repartidor: {
            nombre: repObj.nombre,
            telefono: repObj.telefono,
            tipoVehiculo: repObj.tipoVehiculo || '',
            placa: repObj.placa || ''
          },
          repartidorId: repId,
          tarifa: repTarifa
        }
      });
      return updated;
    } catch (err) {
      if (err && (err.status === 404 || String(err.message).toLowerCase().includes('ruta no encontrada') || String(err.message).includes('/repartidor'))) {
        const body = {
          repartidor: {
            nombre: repObj.nombre || '',
            telefono: repObj.telefono || '',
            tipoVehiculo: repObj.tipoVehiculo || '',
            placa: repObj.placa || ''
          },
          observaciones: repartidorData.notas || undefined
        };
        if (repId) body.repartidorId = repId;
        const updated2 = await request(`/api/domicilios/${dom.id}`, { method: 'PUT', body });
        if (repTarifa !== undefined && repTarifa !== null) {
          try {
            await editarTarifaDomicilio(dom.id, repTarifa);
          } catch (e) {}
        }
        return updated2;
      }
      throw err;
    }
  }
  return null;
};

export const editarRepartidor = async (ventaId, repartidor) => {
  return await asignarRepartidor(ventaId, repartidor);
};

export const editarTarifaDomicilio = async (ventaId, tarifa) => {
  const dom = await getDomicilioByVentaId(ventaId);
  if (dom) {
    return await request(`/api/domicilios/${dom.id}/tarifa`, {
      method: 'PATCH',
      body: { tarifa }
    });
  }
  return null;
};

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

// ----------------------------------------------------------------------
// TARIFAS DOMICILIO
// ----------------------------------------------------------------------
export const getTarifasDomicilio = async () => {
  const data = await request('/api/tarifas-domicilio');
  return Array.isArray(data) ? data : [];
};

export const createTarifaDomicilio = async (tarifa) => {
  const data = await request('/api/tarifas-domicilio', { method: 'POST', body: tarifa });
  return data;
};

export const updateTarifaDomicilio = async (id, tarifa) => {
  const data = await request(`/api/tarifas-domicilio/${id}`, { method: 'PUT', body: tarifa });
  return data;
};

export const deleteTarifaDomicilio = async (id) => {
  await request(`/api/tarifas-domicilio/${id}`, { method: 'DELETE' });
};
