// Policies (CMS content pages) API client.
// Admin endpoints require the `settings` screen permission; public read is open.
import { apiRequest, resolveImageUrl } from "./api";

const mapPolicy = (p) => ({
  id: p?.id || "",
  slug: p?.slug || "",
  title: p?.title || "",
  content: p?.content || "",
  // Keep the storage `path` for the save round-trip; resolve `url` for display.
  images: (p?.images || []).map((img) => ({
    path: img.path,
    url: resolveImageUrl(img.path || img.url),
  })),
});

const unwrap = (response) => response?.data || response || {};

export const policiesService = {
  // Public — customer-facing pages.
  async getPublic(slug) {
    const response = await apiRequest(`/policies/${slug}`);
    return mapPolicy(unwrap(response));
  },

  // Admin — editors.
  async getAdmin(slug) {
    const response = await apiRequest(`/admin/policies/${slug}`);
    return mapPolicy(unwrap(response));
  },

  async list() {
    const response = await apiRequest(`/admin/policies`);
    return (response?.items || []).map(mapPolicy);
  },

  // Multipart save. `keepImages` is the list of existing storage paths to retain;
  // `files` is an array of new File objects to upload. Omit `keepImages` to leave
  // the image gallery untouched (content-only policies).
  async update(slug, { content, title, keepImages, files } = {}) {
    const fd = new FormData();
    if (content !== undefined) fd.append("content", content ?? "");
    if (title !== undefined && title !== null) fd.append("title", title);
    if (keepImages !== undefined) fd.append("keep_images", JSON.stringify(keepImages || []));
    (files || []).forEach((file) => fd.append("files", file));
    const response = await apiRequest(`/admin/policies/${slug}`, { method: "PUT", body: fd });
    return mapPolicy(unwrap(response));
  },
};
