import html2pdf from 'html2pdf.js';
import { formatPrice } from './dataService';

// options: { forBag: boolean }
export const openPrintVoucher = async (venta, domicilio, options = {}) => {
  const forBag = !!options.forBag;
  // Generar HTML del voucher (igual que antes)
  try {
    // Validaciones: no imprimir si la venta o el domicilio están anulados/rechazados/cancelados
    if (!venta) { alert('Venta no encontrada'); return; }
    const blockedVentaStates = ['Anulada', 'Rechazada', 'Cancelado'];
    if (blockedVentaStates.includes(venta.estado)) { alert('No se puede imprimir voucher de una venta anulada o cancelada'); return; }
    if (domicilio && ['Anulada', 'Rechazada', 'Cancelado'].includes(domicilio.estado)) { alert('No se puede imprimir voucher de un domicilio anulado/cancelado'); return; }
    const fecha = venta?.fecha ? new Date(venta.fecha).toLocaleString() : new Date().toLocaleString();
    const detalleRows = (venta.productos || []).map(d => `
      <tr>
        <td style="padding:6px;border:1px solid #ddd">${(d.productoSnapshot?.nombre) || (d.producto?.nombre) || 'Producto'}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:center">${d.cantidad}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:right">${formatPrice(d.precioUnitario||d.precio_unitario||0)}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:right">${formatPrice(d.subtotal||0)}</td>
      </tr>`).join('');

    const domicilioHtml = domicilio ? `
      <h4>Domicilio</h4>
      <p>${domicilio.direccion || ''} ${domicilio.direccion2 || ''}</p>
      <p>${domicilio.ciudad || ''} ${domicilio.provincia || ''}</p>
      <p>Tel: ${domicilio.telefono || ''}</p>
      <p>Estado: ${domicilio.estado || ''}</p>
    ` : '';

    const html = `
      <html>
      <head>
        <title>Voucher Venta ${venta.id}</title>
        <meta charset="utf-8" />
        <style>
          body{font-family: Arial, Helvetica, sans-serif; padding:${forBag ? '6px' : '20px'}; font-size:${forBag ? '12px' : '14px'} }
          .header{display:flex;justify-content:space-between;align-items:center}
          .company{font-weight:bold}
          table{border-collapse:collapse;width:100%;margin-top:10px}
          th, td{font-size:${forBag ? '12px' : '14px'}}
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="company">Mi Tienda</div>
            <div>Voucher de Compra</div>
          </div>
          <div>
            <div>Venta #: ${venta.id}</div>
            <div>Fecha: ${fecha}</div>
          </div>
        </div>

        ${domicilioHtml}

        <h4>Detalle</h4>
        <table>
          <thead>
            <tr>
              <th style="padding:6px;border:1px solid #ddd;text-align:left">Producto</th>
              <th style="padding:6px;border:1px solid #ddd;text-align:center">Cant</th>
              <th style="padding:6px;border:1px solid #ddd;text-align:right">PU</th>
              <th style="padding:6px;border:1px solid #ddd;text-align:right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${detalleRows}
          </tbody>
        </table>

        <div style="margin-top:8px;text-align:right">
          <div style="font-size:${forBag ? '12px' : '14px'}">Subtotal: <strong>${formatPrice(venta.subtotal||0)}</strong></div>
          <div style="font-size:${forBag ? '12px' : '14px'}">Envío: <strong>${formatPrice(venta.shipping||(parseFloat(venta.total||0) - parseFloat(venta.subtotal||0))||0)}</strong></div>
          <div style="margin-top:6px;font-size:${forBag ? '14px' : '18px'}"><strong>Total: ${formatPrice(venta.total||0)}</strong></div>
        </div>

        <hr />
        <p>Gracias por su compra.</p>
      </body>
      </html>
    `;

    // Intentar abrir ventana para imprimir (puede ser bloqueada)
    const w = window.open('', '_blank', 'noopener');
    if (w) {
      try {
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.focus();
        // Imprimir desde la nueva ventana
        setTimeout(() => { try { w.print(); } catch (e) { /* continuar a fallback */ } }, 300);
        return;
      } catch (err) {
        // cerrar ventana si hubo error
        try { w.close(); } catch (e) {}
      }
    }

    // Fallback: generar PDF y forzar descarga usando html2pdf
    try {
      const opt = {
        margin:       forBag ? 4 : 10,
        filename:     `voucher-${venta.id}${forBag ? '-bolsa' : ''}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: [80, 200], orientation: 'portrait' }
      };
      // Crear elemento temporal
      const container = document.createElement('div');
      container.style.padding = forBag ? '6px' : '10px';
      container.innerHTML = html;
      document.body.appendChild(container);
      await html2pdf().from(container).set(opt).save();
      // limpiar
      try { document.body.removeChild(container); } catch (e) {}
      return;
    } catch (pdfErr) {
      console.error('Error generando PDF con html2pdf:', pdfErr);
      alert('No se pudo generar el voucher. Revise su navegador.');
      return;
    }
  } catch (e) {
    console.error('Error imprimiendo voucher', e);
    alert('Error generando voucher de impresión');
  }
};

export default openPrintVoucher;