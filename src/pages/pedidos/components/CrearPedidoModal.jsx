// src/pages/pedidos/components/CrearPedidoModal.jsx
import React from 'react';
import { formatPrice } from '../../../services/api/utils';
import Modal from '../../../components/Modal';

const TIPOS_PEDIDO = [
  { value: 'mostrador', label: 'Mostrador' },
  { value: 'domicilio', label: 'Domicilio' }
];

const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Abono'];

const CrearPedidoModal = ({
  usuarios,
  productos,
  form,
  setForm,
  item,
  setItem,
  seleccionarUsuario,
  setSeleccionarUsuario,
  onSelectProducto,
  onAddItem,
  onRemoveItem,
  totalForm,
  onGuardar,
  onClose,
}) => (
  <Modal
    title="Crear Pedido"
    onClose={onClose}
    maxWidth={920}
    footer={
      <>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          <i className="fas fa-times me-1"></i>Cancelar
        </button>
        <button type="button" className="btn btn-primary" onClick={onGuardar}>
          <i className="fas fa-save me-1"></i>Crear Pedido
        </button>
      </>
    }
  >
    <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          <div className="row g-3">
            <div className="col-12 mb-3">
              <label className="form-label fw-bold">¿Quién hace el pedido?</label>
              <div className="d-flex gap-3">
                <div className="form-check">
                  <input type="radio" className="form-check-input" id="selUser" checked={seleccionarUsuario} onChange={() => setSeleccionarUsuario(true)} />
                  <label className="form-check-label" htmlFor="selUser">Usuario registrado</label>
                </div>
                <div className="form-check">
                  <input type="radio" className="form-check-input" id="selNombre" checked={!seleccionarUsuario} onChange={() => setSeleccionarUsuario(false)} />
                  <label className="form-check-label" htmlFor="selNombre">Solo nombre del comprador</label>
                </div>
              </div>
            </div>

            {seleccionarUsuario ? (
              <div className="col-md-6">
                <label className="form-label">Seleccionar Usuario</label>
                <select className="form-select" value={form.usuarioId} onChange={(e) => setForm({ ...form, usuarioId: e.target.value })}>
                  <option value="">Seleccione...</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>{u.nombre} {u.apellido} ({u.documento})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="col-md-6">
                <label className="form-label">Nombre del Comprador</label>
                <input className="form-control" value={form.nombreComprador} onChange={(e) => setForm({ ...form, nombreComprador: e.target.value })} placeholder="Nombre completo" />
              </div>
            )}

            <div className="col-md-3">
              <label className="form-label">Tipo de Pedido</label>
              <select className="form-select" value={form.tipoVenta} onChange={(e) => setForm({ ...form, tipoVenta: e.target.value, delivery: e.target.value === 'domicilio' })}>
                {TIPOS_PEDIDO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Método de Pago</label>
              <select className="form-select" value={form.metodoPago} onChange={(e) => setForm({ ...form, metodoPago: e.target.value })}>
                {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="col-md-4">
              <div className="form-check mt-4">
                <input type="checkbox" className="form-check-input" id="deliveryPed" checked={!!form.delivery} onChange={(e) => setForm({ ...form, delivery: e.target.checked, tipoVenta: e.target.checked ? 'domicilio' : 'mostrador' })} />
                <label className="form-check-label" htmlFor="deliveryPed">Requiere Delivery/Domicilio</label>
              </div>
            </div>

            {form.delivery && (
              <>
                <div className="col-md-4">
                  <label className="form-label">Dirección</label>
                  <input className="form-control" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Teléfono</label>
                  <input className="form-control" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
                </div>
              </>
            )}

            <div className="col-12">
              <label className="form-label fw-bold">Agregar Productos</label>
              <div className="card mb-2">
                <div className="card-body py-2">
                  <div className="row g-2 align-items-end">
                    <div className="col-md-4">
                      <label className="form-label small mb-1">Producto</label>
                      <select className="form-select form-select-sm" value={item.productoId} onChange={(e) => onSelectProducto(e.target.value)}>
                        <option value="">Seleccione producto...</option>
                        {productos.map(p => (
                          <option key={p._id || p.id} value={p._id || p.id}>{p.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label small mb-1">Cantidad</label>
                      <input className="form-control form-control-sm" type="number" min="1" value={item.cantidad} onChange={(e) => setItem({ ...item, cantidad: parseInt(e.target.value) || 1 })} />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label small mb-1">Precio</label>
                      <input className="form-control form-control-sm" type="number" value={item.precio} onChange={(e) => setItem({ ...item, precio: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="col-md-3">
                      <button className="btn btn-sm btn-primary w-100" onClick={onAddItem}>
                        <i className="fas fa-plus"></i> Agregar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {form.items.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-sm mb-0">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map(i => (
                        <tr key={i.id}>
                          <td>{i.nombre}</td>
                          <td>{i.cantidad}</td>
                          <td>{formatPrice(i.precio)}</td>
                          <td>{formatPrice(i.cantidad * i.precio)}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => onRemoveItem(i.id)}>
                              <i className="fas fa-times"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="fw-bold">
                        <td colSpan="3" className="text-end">Total:</td>
                        <td>{formatPrice(totalForm)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            <div className="col-12">
              <label className="form-label">Notas</label>
              <textarea className="form-control" value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
            </div>
          </div>
    </div>
  </Modal>
);

export default CrearPedidoModal;
