// Centralized cart state backed by the FastAPI /cart endpoints.
// Backend resolves the active cart from Authorization (user) or X-Session-Id (guest).
// On login, auth_service auto-merges any guest cart into the user cart via X-Session-Id.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { cartService } from "@/services/cartService";

const CartContext = createContext(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

const EMPTY_CART = {
  id: "",
  items: [],
  itemCount: 0,
  subtotal: 0,
  currency: "INR",
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const next = await cartService.getCart();
      setCart(next);
      setError("");
      return next;
    } catch (err) {
      setError(err?.message || "Unable to load cart");
      return null;
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  // Re-fetch when the auth token is added/removed in localStorage so the cart
  // switches between guest and user contexts cleanly across tabs.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "auth_token") refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("auth:changed", refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth:changed", refresh);
    };
  }, [refresh]);

  const addItem = useCallback(async (product, quantity = 1) => {
    setLoading(true);
    try {
      const next = await cartService.addItem({
        productId: product.productId || product.id,
        variantId: product.variantId || null,
        quantity,
      });
      setCart(next);
      return next;
    } catch (err) {
      await refresh();
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    try {
      if (quantity <= 0) {
        const next = await cartService.removeItem(itemId);
        setCart(next);
        return next;
      }
      const next = await cartService.updateItem(itemId, { quantity });
      setCart(next);
      return next;
    } catch (err) {
      // Stale cart — e.g. the item id no longer exists after a guest→user cart
      // switch. Resync from the server so the UI self-heals instead of leaving a
      // phantom item ("Cart item not found") until a manual page refresh.
      await refresh();
      throw err;
    }
  }, [refresh]);

  const removeItem = useCallback(async (itemId) => {
    try {
      const next = await cartService.removeItem(itemId);
      setCart(next);
      return next;
    } catch (err) {
      await refresh();
      throw err;
    }
  }, [refresh]);

  const clear = useCallback(async () => {
    const next = await cartService.clearCart();
    setCart(next);
    return next;
  }, []);

  const value = useMemo(
    () => ({
      items: cart.items,
      // Header badge = number of distinct products in the cart, not the sum of
      // quantities. Bumping an item's quantity must not change this count.
      count: cart.items.length,
      totalQuantity: cart.itemCount,
      total: cart.subtotal,
      cart,
      loading,
      error,
      refresh,
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }),
    [cart, loading, error, refresh, addItem, updateQuantity, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
