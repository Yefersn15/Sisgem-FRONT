// src/services/api/carrito.api.js
import { request } from './client';

export const getCart = async () => {
  const data = await request('/api/carrito');
  return data;
};

export const addToCart = async (productoId, cantidad = 1) => {
  const data = await request('/api/carrito/items', {
    method: 'POST',
    body: { productoId, cantidad }
  });
  return data;
};

export const removeFromCart = async (productoId) => {
  const data = await request(`/api/carrito/items/${productoId}`, {
    method: 'DELETE'
  });
  return data;
};

export const updateCartItem = async (productoId, cantidad) => {
  const data = await request(`/api/carrito/items/${productoId}`, {
    method: 'PUT',
    body: { cantidad }
  });
  return data;
};

export const clearCart = async () => {
  const data = await request('/api/carrito', { method: 'DELETE' });
  return data;
};

// Para compatibilidad hacia atrás - obtener items con detalles
export const getCartItemsWithDetails = async () => {
  const data = await request('/api/carrito');
  if (!data || !data.items) return [];
  return data.items.map(item => ({
    producto: item.producto,
    cantidad: item.cantidad
  }));
};
