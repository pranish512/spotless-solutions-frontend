// Fuzzy search across products + services (with category) via /api/search.
import { apiRequest, buildQuery, resolveImageUrl } from "./api";

const mapItem = (it) => ({
  id: it.id,
  type: it.type,
  name: it.name || "",
  slug: it.slug || "",
  category: it.category || "",
  categorySlug: it.category_slug || "",
  image: resolveImageUrl(it.image),
  price: it.price ?? null,
});

export const searchService = {
  async search(q, limit = 8) {
    const response = await apiRequest(`/search${buildQuery({ q, limit })}`);
    const d = response?.data || {};
    return {
      query: d.query || q,
      products: (d.products || []).map(mapItem),
      services: (d.services || []).map(mapItem),
    };
  },
};
