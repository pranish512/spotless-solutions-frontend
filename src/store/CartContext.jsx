// Centralized cart state with localStorage persistence.
// Survives refresh and re-login. Single source of truth for cart UI + checkout.
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { storage, STORAGE_KEYS } from "@/services/storage";
import { cartService } from "@/services/cartService";

const CartContext = createContext(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => storage.get(STORAGE_KEYS.CART, []));

  useEffect(() => {
    storage.set(STORAGE_KEYS.CART, items);
  }, [items]);

  const addItem = useCallback((product, qty = 1) => setItems((prev) => cartService.addItem(prev, product, qty)), []);
  const updateQuantity = useCallback((id, qty) => setItems((prev) => cartService.updateQuantity(prev, id, qty)), []);
  const removeItem = useCallback((id) => setItems((prev) => cartService.removeItem(prev, id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({
    items,
    total: cartService.total(items),
    count: cartService.count(items),
    addItem, updateQuantity, removeItem, clear,
  }), [items, addItem, updateQuantity, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
