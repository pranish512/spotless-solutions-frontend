import { apiRequest, buildQuery } from "./api";

const toUiStatus = (status) => (status === "active" || status === true ? "Active" : "Inactive");
const toApiStatus = (status) => (status === "Active" ? "active" : "inactive");
const toActive = (status) => status === "Active";

const unwrapList = (response) => ({
  total: response.total || 0,
  page: response.page || 1,
  limit: response.limit || 10,
  items: response.items || [],
});

const mapBranch = (item) => ({
  id: item.id,
  name: item.name,
  description: item.description || "",
  status: toUiStatus(item.status),
});

const mapUserType = (item) => ({
  id: item.id,
  name: item.name,
  kind: item.kind || "staff",
  description: item.description || "",
  status: toUiStatus(item.status),
});

const mapTag = (item) => ({
  id: item.id,
  name: item.name,
  icon: item.icon || "",
  color: item.color || "",
  status: toUiStatus(item.active),
});

const mapCategory = (item) => ({
  id: item.id,
  name: item.name,
  slug: item.slug,
  icon: item.icon || "",
  parentId: item.parent_id || "",
  sortOrder: item.sort_order || 0,
  productCount: item.products_count || item.productCount || 0,
  status: toUiStatus(item.active),
});

export const adminMastersService = {
  async listBranches({ page = 1, limit = 100, search = "" } = {}) {
    const response = await apiRequest(`/admin/branches${buildQuery({ page, limit, search })}`);
    return { ...unwrapList(response), items: unwrapList(response).items.map(mapBranch) };
  },
  async createBranch(form) {
    const response = await apiRequest("/admin/branches", {
      method: "POST",
      body: { name: form.name, description: form.description || null, status: toApiStatus(form.status) },
    });
    return mapBranch(response.data);
  },
  async updateBranch(id, form) {
    const response = await apiRequest(`/admin/branches/${id}`, {
      method: "PUT",
      body: { name: form.name, description: form.description || null, status: toApiStatus(form.status) },
    });
    return mapBranch(response.data);
  },
  async toggleBranch(id, status) {
    const response = await apiRequest(`/admin/branches/${id}/status${buildQuery({ active: toActive(status) })}`, { method: "PATCH" });
    return mapBranch(response.data);
  },
  async deleteBranch(id) {
    return apiRequest(`/admin/branches/${id}`, { method: "DELETE" });
  },

  async listUserTypes({ page = 1, limit = 100, search = "" } = {}) {
    const response = await apiRequest(`/admin/user-types${buildQuery({ page, limit, search })}`);
    return { ...unwrapList(response), items: unwrapList(response).items.map(mapUserType) };
  },
  async createUserType(form) {
    const response = await apiRequest("/admin/user-types", {
      method: "POST",
      body: { name: form.name, kind: form.kind || "staff", description: form.description || null, status: toApiStatus(form.status) },
    });
    return mapUserType(response.data);
  },
  async updateUserType(id, form) {
    const response = await apiRequest(`/admin/user-types/${id}`, {
      method: "PUT",
      body: { name: form.name, kind: form.kind || "staff", description: form.description || null, status: toApiStatus(form.status) },
    });
    return mapUserType(response.data);
  },
  async toggleUserType(id, status) {
    const response = await apiRequest(`/admin/user-types/${id}/status${buildQuery({ active: toActive(status) })}`, { method: "PATCH" });
    return mapUserType(response.data);
  },
  async deleteUserType(id) {
    return apiRequest(`/admin/user-types/${id}`, { method: "DELETE" });
  },

  async listTags({ page = 1, limit = 100, search = "" } = {}) {
    const response = await apiRequest(`/admin/tags${buildQuery({ page, limit, search })}`);
    return { ...unwrapList(response), items: unwrapList(response).items.map(mapTag) };
  },
  async createTag(form) {
    const response = await apiRequest("/admin/tags", {
      method: "POST",
      body: { name: form.name, icon: form.icon || null, color: form.color || null, active: toActive(form.status) },
    });
    return mapTag(response.data);
  },
  async updateTag(id, form) {
    const response = await apiRequest(`/admin/tags/${id}`, {
      method: "PUT",
      body: { name: form.name, icon: form.icon || null, color: form.color || null, active: toActive(form.status) },
    });
    return mapTag(response.data);
  },
  async toggleTag(id, status) {
    const response = await apiRequest(`/admin/tags/${id}/status${buildQuery({ active: toActive(status) })}`, { method: "PATCH" });
    return mapTag(response.data);
  },
  async deleteTag(id) {
    return apiRequest(`/admin/tags/${id}`, { method: "DELETE" });
  },

  async listCategories({ page = 1, limit = 100, search = "" } = {}) {
    const response = await apiRequest(`/admin/categories${buildQuery({ page, limit, search })}`);
    return { ...unwrapList(response), items: unwrapList(response).items.map(mapCategory) };
  },
  async createCategory(form) {
    const response = await apiRequest("/admin/categories", {
      method: "POST",
      body: { name: form.name, slug: form.slug, icon: form.icon || null, sort_order: Number(form.sortOrder || 0), active: toActive(form.status) },
    });
    return mapCategory(response.data);
  },
  async updateCategory(id, form) {
    const response = await apiRequest(`/admin/categories/${id}`, {
      method: "PUT",
      body: { name: form.name, slug: form.slug, icon: form.icon || null, sort_order: Number(form.sortOrder || 0), active: toActive(form.status) },
    });
    return mapCategory(response.data);
  },
  async toggleCategory(id, status) {
    const response = await apiRequest(`/admin/categories/${id}/status${buildQuery({ active: toActive(status) })}`, { method: "PATCH" });
    return mapCategory(response.data);
  },
  async deleteCategory(id) {
    return apiRequest(`/admin/categories/${id}`, { method: "DELETE" });
  },
};
