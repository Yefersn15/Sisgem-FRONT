// src/pages/pagos/hooks/usePagoDetalle.js
import { useState, useEffect } from 'react';
import { getPagos, getVentaById, getDomicilioByVentaId } from '../services/pagosService';

export const usePagoDetalle = (id) => {
  const [pago, setPago] = useState(null);
  const [venta, setVenta] = useState(null);
  const [domicilio, setDomicilio] = useState(null);
  const [pagosVenta, setPagosVenta] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const todosLosPagos = await getPagos();
        const misPagos = todosLosPagos.filter(pg => String(pg.ventaId) === String(id));
        if (misPagos.length > 0) {
          setPagosVenta(misPagos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
          if (misPagos.length === 1) {
            setPago(misPagos[0]);
          }
        }
      } catch (e) {
        console.log('Error cargando pagos');
      }

      try {
        const v = await getVentaById(id);
        setVenta(v);
      } catch (e) {
        console.log('Error cargando venta');
      }

      try {
        const dom = await getDomicilioByVentaId(id);
        setDomicilio(dom);
      } catch (e) {
        console.log('No hay domicilio');
      }

      setLoading(false);
    })();
  }, [id]);

  const shipping = domicilio?.costo ? parseFloat(domicilio.costo) : (venta?.shipping || 0);
  const totalVenta = (venta?.subtotal || 0) + shipping;

  const totalPagado = pagosVenta
    .filter(p => {
      const estado = String(p.estado)?.toLowerCase();
      return estado === 'aplicado' || estado === 'pendiente';
    })
    .reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
  const saldoPendiente = Math.max(0, totalVenta - totalPagado);

  return { pago, venta, domicilio, pagosVenta, loading, shipping, totalVenta, totalPagado, saldoPendiente };
};
