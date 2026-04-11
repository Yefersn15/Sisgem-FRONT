import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProveedorById, getProviderCartItemsWithDetails, createOrdenCompra, clearProviderCart } from '../../services/dataService';
import { useCart } from '../../context/CartContext';

const OrdenCompraDraft = () => {
  const { id: proveedorId } = useParams();
  const navigate = useNavigate();
  const proveedor = getProveedorById(proveedorId) || null;
  const { getProviderCartItemsWithDetails: getCartDetailsFromContext, clearProviderCart: clearProviderCartContext } = useCart();
  const [items, setItems] = useState([]);
  const [notas, setNotas] = useState('');

  useEffect(() => {
    // preferir la versión del context si existe, sino usar el servicio
    let details = [];
    try { details = getCartDetailsFromContext ? getCartDetailsFromContext(proveedorId) : getProviderCartItemsWithDetails(proveedorId); } catch (e) { details = getProviderCartItemsWithDetails(proveedorId); }
    setItems(details.map(d => ({ ...d })));
  }, [proveedorId]);

  const total = items.reduce((s, it) => s + ((it.source === 'producto' ? (it.producto?.precioUnitario || 0) : (it.catalogItem?.precioSugerido || 0)) * (it.cantidad || 0)), 0);

  const updateCantidad = (idx, v) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, cantidad: parseInt(v) || 0 } : it));
  };

  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleCreateAndSend = () => {
    if (!proveedor) return alert('Proveedor no encontrado');
    if (items.length === 0) return alert('No hay items en la orden');

    // Construir items para createOrdenCompra
    const ordenItems = items.map(it => {
      if (it.source === 'producto') {
        return { productoId: it.producto.id, nombre: it.producto.nombre, cantidad: it.cantidad, precioUnitario: it.producto.precioUnitario };
      }
      // catálogo
      return { productoId: '', nombre: it.catalogItem.nombre, cantidad: it.cantidad, precioUnitario: it.catalogItem.precioSugerido };
    });

    const orden = createOrdenCompra({ proveedorId, items: ordenItems, notas });

    // Preparar mensaje de WhatsApp
    const phoneRaw = ((proveedor.telefonoPais || '') + (proveedor.telefono || '')).replace(/\D/g, '');
    if (!phoneRaw) {
      alert('Proveedor no tiene teléfono válido para enviar por WhatsApp. Orden creada localmente.');
      navigate(`/ordenes/${orden.id}`);
      return;
    }

    let msg = `Orden de Compra - ${proveedor.nombre || ''}\n`;
    msg += `ID orden: ${orden.id}\n\n`;
    msg += `Items:\n`;
    orden.items.forEach(it => {
      msg += `- ${it.cantidad} x ${it.nombre} @ $${Math.round(it.precioUnitario).toLocaleString('es-CO', { minimumFractionDigits: 0 })}\n`;
    });
    msg += `\nTotal: $${Math.round(orden.total).toLocaleString('es-CO', { minimumFractionDigits: 0 })}\n`;
    if (notas) msg += `Notas: ${notas}\n`;

    // Limpiar carrito del proveedor
    try { clearProviderCartContext ? clearProviderCartContext(proveedorId) : clearProviderCart(proveedorId); } catch (e) { /* ignore */ }

    // Abrir Whatsapp (wa.me) en nueva pestaña
    const waUrl = `https://wa.me/${phoneRaw}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
    navigate(`/ordenes/${orden.id}`);
  };

  return (
    <div className="container my-4">
      <h3>Orden de Compra - Borrador</h3>
      {!proveedor ? <div className="alert alert-warning">Proveedor no encontrado</div> : (
        <div className="card p-3 mb-3">
          <h5>{proveedor.nombre}</h5>
          <div className="small text-muted">Tel: {proveedor.telefonoPais || ''} {proveedor.telefono || ''}</div>
        </div>
      )}

      <div className="card p-3 mb-3">
        <h5>Items</h5>
        {items.length === 0 ? <div className="text-muted">No hay items en la orden</div> : (
          <ul className="list-group">
            {items.map((it, idx) => (
              <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-bold">{it.source === 'producto' ? it.producto.nombre : it.catalogItem.nombre}</div>
                  <div className="small text-muted">Precio: ${Math.round(it.source === 'producto' ? it.producto.precioUnitario : it.catalogItem.precioSugerido).toLocaleString('es-CO', { minimumFractionDigits: 0 })}</div>
                </div>
                <div className="d-flex align-items-center">
                  <input type="number" className="form-control me-2" style={{ width: '80px' }} min={1} value={it.cantidad} onChange={(e) => updateCantidad(idx, e.target.value)} />
                  <button className="btn btn-sm btn-danger" onClick={() => removeItem(idx)}>Quitar</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">Notas (opcional)</label>
        <textarea className="form-control" value={notas} onChange={(e) => setNotas(e.target.value)} />
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <div><strong>Total:</strong> ${Math.round(total).toLocaleString('es-CO', { minimumFractionDigits: 0 })}</div>
        <div>
          <button className="btn btn-secondary me-2" onClick={() => navigate(-1)}>Volver</button>
          <button className="btn btn-primary" onClick={handleCreateAndSend}>Crear y Enviar por WhatsApp</button>
        </div>
      </div>
    </div>
  );
};

export default OrdenCompraDraft;