// Cart API client. Backend resolves user vs guest from Authorization / X-Session-Id.
import { apiRequest, resolveImageUrl } from "./api";

const mapCartItem = (item) => ({
  id: item.id,                       // cart_item id, used for PATCH/DELETE
  productId: item.product_id,
  variantId: item.variant_id || null,
  name: item.product_name || "",
  slug: item.product_slug || "",
  image: resolveImageUrl(item.product_image),
  price: item.unit_price ?? 0,
  quantity: item.quantity ?? 0,
  lineTotal: item.line_total ?? (item.unit_price ?? 0) * (item.quantity ?? 0),
});

const mapCart = (cart) => {
  const items = (cart?.items || []).map(mapCartItem);
  return {
    id: cart?.id || "",
    userId: cart?.user_id || null,
    sessionId: cart?.session_id || null,
    status: cart?.status || "active",
    items,
    itemCount: cart?.item_count ?? items.reduce((s, i) => s + i.quantity, 0),
    subtotal: cart?.subtotal ?? items.reduce((s, i) => s + i.lineTotal, 0),
    currency: cart?.currency || "INR",
  };
};

const unwrap = (response) => response?.data || response || {};

export const cartService = {
  async getCart() {
    const response = await apiRequest("/cart");
    return mapCart(unwrap(response));
  },

  async addItem({ productId, variantId = null, quantity = 1 }) {
    const response = await apiRequest("/cart/items", {
      method: "POST",
      body: { product_id: productId, variant_id: variantId, quantity },
    });
    return mapCart(unwrap(response));
  },

  async updateItem(itemId, { quantity, variantId } = {}) {
    const body = {};
    if (quantity !== undefined) body.quantity = quantity;
    if (variantId !== undefined) body.variant_id = variantId;
    const response = await apiRequest(`/cart/items/${itemId}`, {
      method: "PATCH",
      body,
    });
    return mapCart(unwrap(response));
  },

  async removeItem(itemId) {
    const response = await apiRequest(`/cart/items/${itemId}`, { method: "DELETE" });
    return mapCart(unwrap(response));
  },

  async clearCart() {
    const response = await apiRequest("/cart", { method: "DELETE" });
    return mapCart(unwrap(response));
  },

  async mergeCart(sessionId) {
    const response = await apiRequest("/cart/merge", {
      method: "POST",
      body: { session_id: sessionId },
    });
    return mapCart(unwrap(response));
  },
};
