import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCart, addToCart as add, removeFromCart as remove, updateCartItem as update, clearCart as clear, getProviderCartItemsWithDetails as getProviderCartItemsWithDetailsService, addToProviderCart as addToProviderCartService, removeFromProviderCart as removeFromProviderCartService, updateProviderCartItem as updateProviderCartItemService, getProviderCart as getProviderCartService, clearProviderCart as clearProviderCartService } from '../services/dataService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const auth = useAuth();
  const user = auth?.user;
  const [cart, setCart] = useState([]);
  const [cartItemsWithDetails, setCartItemsWithDetails] = useState([]);
  const [providerCartsCache, setProviderCartsCache] = useState({});
  const [loading, setLoading] = useState(true);

  // Cargar carrito desde la API cuando el usuario esté autenticado
  useEffect(() => {
    const loadCart = async () => {
      if (user && user.documento) {
        try {
          const cartData = await getCart();
          // Asegurar que cada item tenga producto.id
          const itemsWithId = (cartData.items || []).map(item => ({
            ...item,
            producto: item.producto && typeof item.producto === 'object'
              ? { ...item.producto, id: item.producto._id || item.producto.id }
              : item.producto
          }));
          setCart(itemsWithId);
          setCartItemsWithDetails(itemsWithId);
        } catch (err) {
          console.error('Error cargando carrito:', err);
          setCart([]);
          setCartItemsWithDetails([]);
        }
      } else {
        // Si no hay usuario, limpiar el carrito
        setCart([]);
        setCartItemsWithDetails([]);
      }
      setLoading(false);
    };
    loadCart();
  }, [user]);

  const addToCart = async (productoId, cantidad = 1) => {
    try {
      const cartData = await add(productoId, cantidad);
      setCart(cartData.items || []);
      setCartItemsWithDetails(cartData.items.map(item => ({
        ...item,
        producto: item.producto && item.producto._id ? { ...item.producto, id: item.producto._id } : item.producto
      })) || []);
    } catch (err) {
      console.error('Error al agregar al carrito:', err);
    }
  };

  const removeFromCart = async (productoId) => {
    try {
      const cartData = await remove(productoId);
      const itemsWithId = (cartData.items || []).map(item => ({
        ...item,
        producto: item.producto && typeof item.producto === 'object'
          ? { ...item.producto, id: item.producto._id || item.producto.id }
          : item.producto
      }));
      setCart(itemsWithId);
      setCartItemsWithDetails(itemsWithId);
    } catch (err) {
      console.error('Error al eliminar del carrito:', err);
    }
  };

  const updateCartItem = async (productoId, cantidad) => {
    try {
      if (!productoId) {
        console.error('Error: productoId es undefined');
        return;
      }
      const cartData = await update(productoId, cantidad);
      const itemsWithId = (cartData.items || []).map(item => ({
        ...item,
        producto: item.producto && typeof item.producto === 'object'
          ? { ...item.producto, id: item.producto._id || item.producto.id }
          : item.producto
      }));
      setCart(itemsWithId);
      setCartItemsWithDetails(itemsWithId);
    } catch (err) {
      console.error('Error al actualizar el carrito:', err);
    }
  };

  const clearCart = async () => {
    try {
      await clear();
      setCart([]);
      setCartItemsWithDetails([]);
    } catch (err) {
      console.error('Error al vaciar el carrito:', err);
    }
  };

  // --- Funciones para carrito del proveedor (órdenes de compra) ---
  const addToProviderCart = (proveedorId, refId, cantidad = 1, source = 'producto') => {
    const newCart = addToProviderCartService(proveedorId, refId, cantidad, source);
    setProviderCartsCache(prev => ({ ...prev, [proveedorId]: newCart }));
    return newCart;
  };

  const removeFromProviderCart = (proveedorId, refId, source = 'producto') => {
    const newCart = removeFromProviderCartService(proveedorId, refId, source);
    setProviderCartsCache(prev => ({ ...prev, [proveedorId]: newCart }));
    return newCart;
  };

  const updateProviderCartItem = (proveedorId, refId, cantidad, source = 'producto') => {
    const newCart = updateProviderCartItemService(proveedorId, refId, cantidad, source);
    setProviderCartsCache(prev => ({ ...prev, [proveedorId]: newCart }));
    return newCart;
  };

  const getProviderCartItemsWithDetails = (proveedorId) => {
    try {
      return getProviderCartItemsWithDetailsService(proveedorId);
    } catch (e) {
      return [];
    }
  };

  const getProviderCart = (proveedorId) => getProviderCartService(proveedorId);

  const clearProviderCart = (proveedorId) => {
    clearProviderCartService(proveedorId);
    setProviderCartsCache(prev => {
      const copy = { ...prev };
      delete copy[proveedorId];
      return copy;
    });
  };

  // Calcular total
  const subtotal = cartItemsWithDetails.reduce((acc, item) => {
    const precio = item.producto?.precio || item.producto?.precioUnitario || 0;
    return acc + (precio * item.cantidad);
  }, 0);

  const value = {
    cart,
    cartItemsWithDetails,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    // provider cart API
    addToProviderCart,
    removeFromProviderCart,
    updateProviderCartItem,
    getProviderCartItemsWithDetails,
    getProviderCart,
    clearProviderCart,
    itemCount: cart.reduce((acc, item) => acc + item.cantidad, 0),
    subtotal,
    loading
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;