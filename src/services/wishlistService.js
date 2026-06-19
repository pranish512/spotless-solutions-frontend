import { apiRequest, buildQuery, resolveImageUrl } from "./api";

const mapWishlistItem = (item) => ({
  id: item.id,
  productId: item.product_id,
  name: item.product_name || "",
  slug: item.product_slug || "",
  image: resolveImageUrl(item.product_image),
  price: item.product_price ?? 0,
  originalPrice: item.product_actual_price ?? 0,
  active: !!item.product_active,
});

const unwrap = (response) => response?.data || response || {};

export const wishlistService = {
  async listWishlist({ page = 1, limit = 50 } = {}) {
    const response = await apiRequest(`/user/wishlist${buildQuery({ page, limit })}`);
    const items = (response?.items || []).map(mapWishlistItem);
    return {
      total: response?.total || items.length,
      page: response?.page || page,
      limit: response?.limit || limit,
      items,
    };
  },

  async addToWishlist(productId) {
    const response = await apiRequest("/user/wishlist", {
      method: "POST",
      body: { product_id: productId },
    });
    return mapWishlistItem(unwrap(response));
  },

  async removeFromWishlist(productId) {
    return apiRequest(`/user/wishlist/product/${productId}`, { method: "DELETE" });
  },

  async clearWishlist() {
    return apiRequest("/user/wishlist", { method: "DELETE" });
  },
};
