import { apiRequest, buildQuery, resolveImageUrl } from "./api";

const mapProductSummary = (p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  category: p.category || "",
  categorySlug: p.category_slug || "",
  image: resolveImageUrl(p.image),
  actualPrice: p.actual_price ?? 0,
  sellingPrice: p.selling_price ?? 0,
  discountPercent: p.discount_percent ?? 0,
  quantityAvailable: p.quantity_available ?? 0,
  avgRating: Number(p.avg_rating ?? 0),
  ratingCount: p.rating_count ?? 0,
  showRating: !!p.show_rating,
  inStock: !!p.in_stock,
});

const mapProductDetail = (p) => ({
  ...mapProductSummary(p),
  description: p.description || "",
  highlights: Array.isArray(p.highlights) ? p.highlights : [],
  sku: p.sku || null,
  manufacturer: p.manufacturer || null,
  hsn: p.hsn || null,
  gstPercent: p.gst_percent ?? 0,
  videoDemo: p.video_demo || null,
  images: (p.images || []).map((img) => ({
    id: img.id,
    url: resolveImageUrl(img.url),
    alt: img.alt || "",
    sortOrder: img.sort_order ?? 0,
  })),
  variants: (p.variants || []).map((v) => ({
    id: v.id,
    sku: v.sku,
    size: v.size,
    volume: v.volume,
    color: v.color,
    sellingPrice: v.selling_price,
    quantityAvailable: v.quantity_available,
    image: resolveImageUrl(v.image),
    active: v.active,
  })),
  tags: p.tags || [],
  enableRating: !!p.enable_rating,
  productType: p.product_type || "simple",
});

const mapCategory = (c) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  icon: resolveImageUrl(c.icon),
  parentId: c.parent_id || null,
  sortOrder: c.sort_order ?? 0,
});

const mapTag = (t) => ({
  id: t.id,
  name: t.name,
  icon: t.icon || null,
  color: t.color || null,
});

const unwrap = (response) => response?.data || response || {};

export const productService = {
  async listProducts(params = {}) {
    const response = await apiRequest(`/products${buildQuery(params)}`);
    const items = (response?.items || []).map(mapProductSummary);
    return {
      total: response?.total || items.length,
      page: response?.page || 1,
      limit: response?.limit || items.length,
      items,
    };
  },

  async getProductBySlug(slug) {
    const response = await apiRequest(`/products/${encodeURIComponent(slug)}`);
    return mapProductDetail(unwrap(response));
  },

  async listCategories() {
    const response = await apiRequest("/categories");
    return (response?.items || []).map(mapCategory);
  },

  async listTags() {
    const response = await apiRequest("/tags");
    return (response?.items || []).map(mapTag);
  },
};
