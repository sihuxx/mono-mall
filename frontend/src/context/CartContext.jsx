import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../utils/api.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCart({ items: [] });
    }
  }, [user]);

  const refreshCart = async () => {
    try {
      const { cart } = await api.getCart();
      setCart(cart);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    }
  };

  const addToCart = async (productId, qty = 1) => {
    if (!user) {
      showToast('로그인이 필요합니다');
      return;
    }
    try {
      const { cart } = await api.addToCart({ productId, qty });
      setCart(cart);
      showToast('장바구니에 추가되었습니다');
    } catch (err) {
      showToast(err.message);
    }
  };

  const updateQty = async (productId, qty) => {
    try {
      const { cart } = await api.updateCart({ productId, qty });
      setCart(cart);
    } catch (err) {
      showToast(err.message);
    }
  };

  const removeItem = async (productId) => {
    try {
      const { cart } = await api.removeFromCart(productId);
      setCart(cart);
    } catch (err) {
      showToast(err.message);
    }
  };

  const itemCount = cart.items?.reduce((sum, i) => sum + i.qty, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, itemCount, refreshCart, addToCart, updateQty, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
