// src/services/api/domicilios.api.js
import { request } from './client';
import { createDireccion } from './usuarios.api';
import { asignarRepartidor, editarRepartidor, editarTarifaDomicilio } from './domicilios.repartidor.api';
import { importDomicilios, exportDomicilios } from './domicilios.excel.api';

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

// Domicilios asignados al repartidor autenticado (vista "Mis Entregas") y
// cambio de estado de UNO de sus propios domicilios; distinto de
// getDomicilioByVentaId/updateDomicilioEstado que son de uso administrativo.
export const getMisEntregas = async () => {
  try {
    const data = await request('/api/domicilios/mis-domicilios');
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Error obteniendo mis entregas:', e);
    return [];
  }
};

export const cambiarEstadoMiEntrega = (id, estado) =>
  request(`/api/domicilios/${id}/estado-repartidor`, { method: 'PATCH', body: { estado } });

// Domicilios del cliente autenticado (sus propios pedidos a domicilio), vía
// el endpoint dedicado del backend en lugar de filtrar client-side
// getDomicilios()/getVentas() (ambos admin-only, por lo que un cliente normal
// nunca veía nada en "Mis Domicilios").
export const getMisPedidosDomicilio = async () => {
  try {
    const data = await request('/api/domicilios/mis-pedidos-domicilio');
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Error obteniendo mis pedidos a domicilio:', e);
    return [];
  }
};

// Reasignación de repartidor (+ su tarifa) e importación/exportación en
// Excel viven en sus propios archivos (domicilios.repartidor.api.js,
// domicilios.excel.api.js) por ser flujos autocontenidos; se re-exportan
// aquí para que los importadores existentes de `services/api/domicilios.api`
// no tengan que cambiar.
export { asignarRepartidor, editarRepartidor, editarTarifaDomicilio, importDomicilios, exportDomicilios };
