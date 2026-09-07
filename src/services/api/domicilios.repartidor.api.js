// src/services/api/domicilios.repartidor.api.js
// Asignación de repartidor a un domicilio (y su tarifa asociada). Separado
// de domicilios.api.js porque es un flujo autocontenido con su propia lógica
// de normalización de datos, no gestión general del domicilio.
import { request } from './client';
import { createDireccion } from './usuarios.api';
import { getDomicilioByVentaId } from './domicilios.api';

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
