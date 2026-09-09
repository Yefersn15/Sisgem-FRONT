// src/pages/ventas/hooks/useVentaDetalle.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  getVentaById,
  getPagosByVenta,
  getTotalPagadoByVenta,
  cambiarEstadoPago,
  cambiarEstado,
  aprobarSolicitudAbono,
  rechazarAbono,
  getDomicilioByVentaId,
} from '../services/ventasService';
import { getProductos } from '../../../services/api/productos.api';
import { useToast } from '../../../context/ToastContext';
import { usePrompt } from '../../../context/ConfirmContext';

const PASOS_ENTREGA = [
  { estado: 'pendiente', label: 'Recibido', icon: 'fa-clipboard-list' },
  { estado: 'aprobado', label: 'Aprobado', icon: 'fa-check' },
  { estado: 'en_preparacion', label: 'Preparando', icon: 'fa-box' },
  { estado: 'asignado', label: 'Asignado', icon: 'fa-motorcycle' },
  { estado: 'en_camino', label: 'En Camino', icon: 'fa-truck' },
  { estado: 'entregado', label: 'Entregado', icon: 'fa-home' }
];

const PASOS_ENTREGA_SIN_PREP = [
  { estado: 'pendiente', label: 'Recibido', icon: 'fa-clipboard-list' },
  { estado: 'aprobado', label: 'Aprobado', icon: 'fa-check' },
  { estado: 'asignado', label: 'Asignado', icon: 'fa-motorcycle' },
  { estado: 'en_camino', label: 'En Camino', icon: 'fa-truck' },
  { estado: 'entregado', label: 'Entregado', icon: 'fa-home' }
];

const ESTADOS_CON_PREP = ['en_preparacion', 'asignado', 'en_camino', 'entregado'];

const ESTADO_BADGES = {
  pendiente: 'bg-warning',
  aprobado: 'bg-info',
  enviado: 'bg-primary',
  recibido: 'bg-success',
  cancelado: 'bg-danger',
  anulado: 'bg-secondary',
  por_validar: 'bg-info',
  completada: 'bg-success',
  rechazada: 'bg-danger',
};
export const getEstadoBadge = (estado) => ESTADO_BADGES[estado] || 'bg-secondary';

export const useVentaDetalle = (id) => {
  const navigate = useNavigate();
  const toast = useToast();
  const prompt = usePrompt();
  const { user, role, hasPermission } = useAuth();
  const [pedido, setPedido] = useState(null);
  const [domicilio, setDomicilio] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [totalPagado, setTotalPagado] = useState(0);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = role?.nombre === 'ADMIN' || role?.nombre === 'Administrador' || user?.rol === 'ADMIN' || user?.rol === 'Administrador';
  const canConfirmPayment = isAdmin || hasPermission('Ventas');

  useEffect(() => {
    (async () => {
      if (!id || id === 'undefined') {
        toast.error('ID de pedido inválido');
        navigate('/admin/ventas');
        return;
      }
      try {
        const p = await getVentaById(id);
        if (!p) {
          toast.error('Pedido no encontrado');
          navigate('/admin/ventas');
          return;
        }
        setPedido(p);

        const dom = await getDomicilioByVentaId(id);
        if (dom) {
          setDomicilio(dom);
        }

        const prods = (await getProductos()) || [];
        setProductos(prods);

        const pagosVenta = await getPagosByVenta(id);
        setPagos(pagosVenta || []);
        const total = await getTotalPagadoByVenta(id);
        setTotalPagado(total || 0);
      } catch (error) {
        console.error('Error al cargar pedido:', error);
        toast.error('Error al cargar los detalles del pedido: ' + (error.message || 'Error desconocido'));
        navigate('/admin/ventas');
        return;
      }

      setLoading(false);
    })();
  }, [id]);

  const getProductoNombre = (productoId) => {
    if (!productoId) return 'Producto desconocido';
    const producto = productos.find(p => p.id === productoId);
    if (producto) return producto.nombre;
    const item = pedido?.productos?.find(i => i.productoId === productoId);
    return item?.productoSnapshot?.nombre || 'Producto';
  };

  const getProductoFoto = (productoId) => {
    const producto = productos.find(p => p.id === productoId);
    return producto?.fotoUrl || '';
  };

  const estadoOrden = String(pedido?.estadoPedido || pedido?.estado || 'pendiente').toLowerCase();
  const esDomicilio = (pedido?.delivery === true || String(pedido?.tipo_venta || '').toLowerCase() === 'domicilio' || !!pedido?.direccion);

  const usarTimelineConPrep = ESTADOS_CON_PREP.includes(estadoOrden);
  const pasosMostrar = usarTimelineConPrep ? PASOS_ENTREGA : PASOS_ENTREGA_SIN_PREP;

  const currentStepIndex = (() => {
    const idx = pasosMostrar.findIndex(p => p.estado === estadoOrden);
    return idx >= 0 ? idx : 0;
  })();

  const statusSteps = pasosMostrar.map((paso, idx) => ({
    ...paso,
    isActive: idx <= currentStepIndex,
    isCurrent: idx === currentStepIndex && estadoOrden !== 'cancelado' && estadoOrden !== 'entregado'
  }));

  const handleCambiarEstadoPago = async (pagoId, estado) => {
    if (!canConfirmPayment) { toast.error('No tiene permisos'); return; }
    try {
      await cambiarEstadoPago(pagoId, estado);
      const pagosVenta = (await getPagosByVenta(id)) || [];
      setPagos(pagosVenta);
      const total = await getTotalPagadoByVenta(id);
      setTotalPagado(total || 0);
      const p = await getVentaById(id);
      setPedido(p);
    } catch (e) {
      console.error('Error cambiando estado de pago:', e);
      toast.error('Error cambiando estado de pago: ' + (e.message || e));
    }
  };

  const handleAvanzarEstado = async (nuevoEstado) => {
    if (!isAdmin) { toast.error('No tiene permisos'); return; }
    try {
      await cambiarEstado(id, nuevoEstado);
      const p = await getVentaById(id);
      setPedido(p);
    } catch (e) {
      toast.error('Error advancing state: ' + (e.message || e));
    }
  };

  const handleAceptarAbono = async (aceptar) => {
    if (!canConfirmPayment) { toast.error('No tiene permisos'); return; }
    try {
      if (aceptar) {
        await aprobarSolicitudAbono(id);
        toast.success('Solicitud de abono aprobada. Stock reducido.');
      } else {
        const motivo = await prompt('Ingrese el motivo del rechazo (opcional):', { title: 'Motivo del rechazo' });
        await rechazarAbono(id, motivo);
        toast.success('Abono rechazado.');
      }
      const p = await getVentaById(id);
      setPedido(p);
    } catch (e) {
      console.error('Error actualizando estado del pedido:', e);
      toast.error('Error actualizando estado del pedido: ' + (e.message || e));
    }
  };

  return {
    pedido,
    domicilio,
    pagos,
    totalPagado,
    loading,
    canConfirmPayment,
    getProductoNombre,
    getProductoFoto,
    estadoOrden,
    esDomicilio,
    statusSteps,
    currentStepIndex,
    pasosMostrar,
    handleCambiarEstadoPago,
    handleAvanzarEstado,
    handleAceptarAbono,
  };
};
