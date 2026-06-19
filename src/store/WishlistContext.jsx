// Lightweight wishlist context — used by ProductCard and ProductDetail to
// reflect the heart-icon filled state and toggle membership.
// Empty for guests; populated on login via "auth:changed" event.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { wishlistService } from "@/services/wishlistService";
import { storage, STORAGE_KEYS } from "@/services/storage";

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};

export const WishlistProvider = ({ children }) => {
  const [ids, setIds] = useState(() => new Set());
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const refresh = useCallback(async () => {
    if (!storage.get(STORAGE_KEYS.AUTH_TOKEN)) {
      setIds(new Set());
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await wishlistService.listWishlist({ limit: 100 });
      setItems(data.items);
      setIds(new Set(data.items.map((i) => i.productId)));
    } catch {
      setIds(new Set());
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onAuth = () => refresh();
    window.addEventListener("auth:changed", onAuth);
    return () => window.removeEventListener("auth:changed", onAuth);
  }, [refresh]);

  const inWishlist = useCallback((productId) => ids.has(productId), [ids]);

  const toggle = useCallback(
    async (productId) => {
      if (!storage.get(STORAGE_KEYS.AUTH_TOKEN)) {
        throw new Error("Please log in to manage your wishlist");
      }
      const has = ids.has(productId);
      // Optimistic UI
      setIds((prev) => {
        const next = new Set(prev);
        if (has) next.delete(productId);
        else next.add(productId);
        return next;
      });
      try {
        if (has) {
          await wishlistService.removeFromWishlist(productId);
        } else {
          await wishlistService.addToWishlist(productId);
        }
        await refresh();
        return !has;
      } catch (err) {
        // Roll back optimistic update on failure
        setIds((prev) => {
          const next = new Set(prev);
          if (has) next.add(productId);
          else next.delete(productId);
          return next;
        });
        throw err;
      }
    },
    [ids, refresh]
  );

  const value = useMemo(
    () => ({ ids, items, loading, refresh, inWishlist, toggle }),
    [ids, items, loading, refresh, inWishlist, toggle]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
