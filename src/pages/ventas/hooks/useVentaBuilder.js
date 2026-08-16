// src/pages/ventas/hooks/useVentaBuilder.js
import { useState } from 'react';
import { createVenta, updateVenta } from '../services/ventasService';

const FORM_INICIAL = {
  metodoPago: 'Efectivo',
  items: [],
  notas: '',
  delivery: false,
  direccion: '',
  telefono: '',
  tipoVenta: 'mostrador',
  usuarioId: '',
  nombreComprador: '',
};

const ITEM_INICIAL = { productoId: '', nombre: '', cantidad: 1, precio: 0 };

export const useVentaBuilder = (productos, onGuardado) => {
  const [modal, setModal] = useState(null);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
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

  const handleEdit = (venta) => {
    setVentaSeleccionada(venta);
    setForm({
      metodoPago: venta.metodoPago,
      items: venta.detalleVenta?.map(i => ({ ...i, id: Date.now() })) || [],
      notas: venta.observaciones || '',
      delivery: venta.delivery,
      direccion: venta.direccion || '',
      telefono: venta.telefono || '',
      tipoVenta: venta.tipo_venta === 'domicilio' ? 'domicilio' : 'mostrador',
      usuarioId: venta.usuarioId || '',
      nombreComprador: ''
    });
    setSeleccionarUsuario(true);
    setModal('editar');
  };

  const addItem = () => {
    const cant = parseFloat(item.cantidad);
    const precio = parseFloat(item.precio);
    if (!item.nombre.trim() || isNaN(cant) || cant <= 0 || isNaN(precio) || precio <= 0) return;
    setForm(prev => ({
      ...prev,
      items: [...prev.items, {
        nombre: item.nombre,
        cantidad: cant,
        precio: precio,
        productoId: item.productoId || null,
        subtotal: cant * precio,
        id: Date.now()
      }]
    }));
    setItem(ITEM_INICIAL);
  };

  const removeItem = (id) => setForm(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));

  const totalForm = form.items.reduce((s, i) => s + (i.cantidad * i.precio), 0);

  const guardarVenta = async () => {
    if (form.items.length === 0) return alert('Agregue al menos un producto');
    if (!seleccionarUsuario && !form.nombreComprador.trim()) return alert('Ingrese nombre del comprador');
    if (seleccionarUsuario && !form.usuarioId) return alert('Seleccione un usuario');
    if (form.delivery && !form.direccion.trim()) return alert('Ingrese dirección de entrega');
    if (form.delivery && !form.telefono.trim()) return alert('Ingrese teléfono de contacto');

    try {
      await createVenta({
        usuarioId: seleccionarUsuario ? form.usuarioId : null,
        nombre_comprador: seleccionarUsuario ? undefined : form.nombreComprador.trim(),
        tipo_venta: form.delivery ? 'domicilio' : 'mostrador',
        metodoPago: form.metodoPago,
        detalleVenta: form.items.map(i => ({
          productoId: i.productoId,
          productoSnapshot: { nombre: i.nombre },
          cantidad: i.cantidad,
          precioUnitario: i.precio,
          subtotal: i.cantidad * i.precio
        })),
        subtotal: totalForm,
        total: totalForm,
        delivery: form.delivery,
        direccion: form.direccion,
        telefono: form.telefono,
        notas: form.notas
      });
      setModal(null);
      onGuardado();
    } catch (err) {
      alert(err.message || 'Error al guardar venta');
    }
  };

  const actualizarVenta = async () => {
    if (!ventaSeleccionada) return;
    try {
      await updateVenta(ventaSeleccionada.id, {
        metodoPago: form.metodoPago,
        detalleVenta: form.items.map(i => ({
          productoId: i.productoId,
          productoSnapshot: { nombre: i.nombre },
          cantidad: i.cantidad,
          precioUnitario: i.precio,
          subtotal: i.cantidad * i.precio
        })),
        subtotal: totalForm,
        total: totalForm,
        delivery: form.delivery,
        direccion: form.direccion,
        telefono: form.telefono,
        notas: form.notas
      });
      setModal(null);
      onGuardado();
    } catch (err) {
      alert(err.message || 'Error al actualizar');
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
    handleEdit,
    addItem,
    removeItem,
    totalForm,
    guardarVenta,
    actualizarVenta,
  };
};
