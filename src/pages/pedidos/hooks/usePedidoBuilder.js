// src/pages/pedidos/hooks/usePedidoBuilder.js
import { useState } from 'react';
import { createPedido } from '../services/pedidosService';

const FORM_INICIAL = {
  tipoVenta: 'mostrador',
  metodoPago: 'Efectivo',
  items: [],
  notas: '',
  delivery: false,
  direccion: '',
  telefono: '',
  usuarioId: '',
  nombreComprador: '',
};

const ITEM_INICIAL = { productoId: '', nombre: '', cantidad: 1, precio: 0 };

export const usePedidoBuilder = (productos, onGuardado) => {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [item, setItem] = useState(ITEM_INICIAL);
  const [seleccionarUsuario, setSeleccionarUsuario] = useState(true);

  const handleCreate = () => {
    setForm(FORM_INICIAL);
    setItem(ITEM_INICIAL);
    setSeleccionarUsuario(true);
    setModal('crear');
  };

  const handleSelectProducto = (productoId) => {
    const producto = productos.find(p => p._id === productoId || p.id === productoId);
    if (producto) {
      setItem({
        productoId: producto._id || producto.id,
        nombre: producto.nombre,
        cantidad: 1,
        precio: producto.precioVenta || producto.precio || 0
      });
    }
  };

  const addItem = () => {
    if (!item.nombre.trim() || item.cantidad <= 0 || item.precio <= 0) return;
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { ...item, id: Date.now(), subtotal: item.cantidad * item.precio }]
    }));
    setItem(ITEM_INICIAL);
  };

  const removeItem = (id) => setForm(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));

  const totalForm = form.items.reduce((s, i) => s + (i.cantidad * i.precio), 0);

  const guardarPedido = async () => {
    if (form.items.length === 0) return alert('Agregue al menos un producto');
    if (!seleccionarUsuario && !form.nombreComprador.trim()) return alert('Ingrese nombre del comprador');
    if (seleccionarUsuario && !form.usuarioId) return alert('Seleccione un usuario');
    if (form.delivery && !form.direccion.trim()) return alert('Ingrese dirección de entrega');
    if (form.delivery && !form.telefono.trim()) return alert('Ingrese teléfono de contacto');

    try {
      await createPedido({
        usuarioId: seleccionarUsuario ? form.usuarioId : null,
        nombre_comprador: seleccionarUsuario ? undefined : form.nombreComprador.trim(),
        tipo_venta: form.delivery ? 'domicilio' : 'mostrador',
        productos: form.items.map(i => ({
          producto: i.productoId,
          cantidad: i.cantidad,
          precio_unitario: i.precio
        })),
        subtotal: totalForm,
        total: totalForm,
        observaciones: form.notas,
        metodo_pago: form.metodoPago,
        telefono: form.delivery ? form.telefono : '',
        direccion: form.delivery ? form.direccion : ''
      });
      setModal(null);
      onGuardado();
    } catch (err) {
      alert(err.message || 'Error al crear pedido');
    }
  };

  return {
    modal,
    setModal,
    form,
    setForm,
    item,
    setItem,
    seleccionarUsuario,
    setSeleccionarUsuario,
    handleCreate,
    handleSelectProducto,
    addItem,
    removeItem,
    totalForm,
    guardarPedido,
  };
};
