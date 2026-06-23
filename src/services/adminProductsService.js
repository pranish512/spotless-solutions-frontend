import { apiRequest, buildQuery } from "./api";

const productTypeToApi = {
  Simple: "simple",
  "Variable size": "variable",
  Bundle: "bundle",
};

const productTypeToUi = {
  simple: "Simple",
  variable: "Variable size",
  bundle: "Bundle",
};

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const findByName = (items, name) => items.find((item) => item.name === name);
const findById = (items, id) => items.find((item) => String(item.id) === String(id));

const toNumber = (value) => Number(value || 0);
const persistedPath = (value) => (value && !String(value).startsWith("blob:") ? value : null);

const highlightsToApi = (value) =>
  String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const highlightsToUi = (value) => (Array.isArray(value) ? value.join("\n") : "");

const buildPayload = (form, refs = {}) => {
  const category = findByName(refs.categories || [], form.category);
  const tagIds = (form.tags || [])
    .map((tagName) => findByName(refs.tags || [], tagName)?.id)
    .filter(Boolean);

  return {
    name: form.name,
    slug: form.slug || slugify(form.name),
    description: form.description || null,
    highlights: highlightsToApi(form.highlights),
    category_id: category?.id || null,
    product_type: productTypeToApi[form.productType] || "simple",
    sku: form.sku || null,
    barcode: form.barcode || null,
    manufacturer: form.manufacturer || null,
    hsn: form.hsn || null,
    gst_percent: toNumber(form.gstPercent),
    actual_price: toNumber(form.actualPrice),
    selling_price: toNumber(form.sellingPrice),
    discount_percent: toNumber(form.discount),
    quantity_available: toNumber(form.quantity),
    image: persistedPath(form.image),
    video_demo: persistedPath(form.videoDemo),
    enable_rating: !!form.enableRating,
    show_rating: !!form.showRating,
    active: form.active !== false,
    tag_ids: tagIds,
    variants:
      form.productType === "Variable size"
        ? [
            {
              sku: form.sku || null,
              size: form.size || null,
              volume: form.volume || null,
              selling_price: toNumber(form.sellingPrice),
              quantity_available: toNumber(form.quantity),
              image: persistedPath(form.image),
              active: true,
            },
          ]
        : [],
    images: persistedPath(form.image) ? [{ url: persistedPath(form.image), alt: form.name, sort_order: 0 }] : [],
    bundle_items:
      form.productType === "Bundle"
        ? (form.bundleItems || []).map((item) => ({
            child_product_id: item.productId,
            quantity: Number(item.quantity || 1),
          }))
        : [],
  };
};

export const mapAdminProduct = (item, refs = {}) => {
  const category = findById(refs.categories || [], item.category_id);
  const tagNames = (item.tag_ids || [])
    .map((tagId) => findById(refs.tags || [], tagId)?.name)
    .filter(Boolean);
  const variant = item.variants?.[0] || {};

  return {
    id: item.id,
    name: item.name || "",
    slug: item.slug || "",
    description: item.description || "",
    highlights: highlightsToUi(item.highlights),
    category: category?.name || "",
    categoryId: item.category_id || "",
    tags: tagNames,
    size: variant.size || "",
    volume: variant.volume || "",
    sku: item.sku || variant.sku || "",
    image: item.image || item.images?.[0]?.url || "",
    videoDemo: item.video_demo || "",
    quantity: item.quantity_available || 0,
    actualPrice: item.actual_price || 0,
    sellingPrice: item.selling_price || 0,
    discount: item.discount_percent || 0,
    gstPercent: item.gst_percent || 18,
    barcode: item.barcode || "",
    manufacturer: item.manufacturer || "",
    hsn: item.hsn || "",
    productType: productTypeToUi[item.product_type] || "Simple",
    bundleItems: (item.bundle_items || []).map((bundleItem) => ({
      productId: bundleItem.child_product_id,
      quantity: bundleItem.quantity,
    })),
    enableRating: item.enable_rating !== false,
    showRating: item.show_rating !== false,
    active: item.active !== false,
    avgRating: Number(item.avg_rating ?? 0),
    ratingCount: Number(item.rating_count ?? 0),
  };
};

const unwrapList = (response) => ({
  total: response.total || 0,
  page: response.page || 1,
  limit: response.limit || 10,
  items: response.items || [],
});

export const adminProductsService = {
  async listProducts(params = {}, refs = {}) {
    const response = await apiRequest(`/admin/products${buildQuery({ page: 1, limit: 100, ...params })}`);
    const list = unwrapList(response);
    return { ...list, items: list.items.map((item) => mapAdminProduct(item, refs)) };
  },
  async getProduct(id, refs = {}) {
    const response = await apiRequest(`/admin/products/${id}`);
    return mapAdminProduct(response.data, refs);
  },
  async createProduct(form, refs = {}) {
    const response = await apiRequest("/admin/products", {
      method: "POST",
      body: buildPayload(form, refs),
    });
    return mapAdminProduct(response.data, refs);
  },
  async updateProduct(id, form, refs = {}) {
    const response = await apiRequest(`/admin/products/${id}`, {
      method: "PUT",
      body: buildPayload(form, refs),
    });
    return mapAdminProduct(response.data, refs);
  },
  async toggleProduct(id, active, refs = {}) {
    const response = await apiRequest(`/admin/products/${id}/status${buildQuery({ active })}`, { method: "PATCH" });
    return mapAdminProduct(response.data, refs);
  },
  async deleteProduct(id) {
    return apiRequest(`/admin/products/${id}`, { method: "DELETE" });
  },
};
