import { apiRequest, buildQuery } from "./api";

// API status mappers mirror adminMastersService conventions.
const toUiStatus = (status) => (status === "active" || status === true ? "Active" : "Inactive");
const toApiStatus = (status) => (status === "Active" ? "active" : "inactive");
const toActive = (status) => status === "Active";

const unwrapList = (response) => ({
  total: response?.total || 0,
  page: response?.page || 1,
  limit: response?.limit || 10,
  items: response?.items || [],
});

const mapService = (item) => ({
  id: item.id,
  slug: item.slug,
  name: item.name,
  description: item.description || "",
  image: item.image_url || item.image || "",
  brochureName: item.brochure_name || "",
  brochureUrl: item.brochure_url || "",
  status: toUiStatus(item.status ?? item.active),
});

const buildFormData = (form) => {
  const fd = new FormData();
  fd.append("name", form.name);
  fd.append("description", form.description || "");
  fd.append("status", toApiStatus(form.status));
  fd.append("active", String(toActive(form.status)));
  if (form.imageFile) fd.append("image", form.imageFile);
  if (form.brochureFile) fd.append("brochure", form.brochureFile);
  return fd;
};

export const adminServicesService = {
  async listServices({ page = 1, limit = 100, search = "" } = {}) {
    const response = await apiRequest(`/admin/services${buildQuery({ page, limit, search })}`);
    return { ...unwrapList(response), items: unwrapList(response).items.map(mapService) };
  },
  async createService(form) {
    const response = await apiRequest("/admin/services", { method: "POST", body: buildFormData(form) });
    return mapService(response.data);
  },
  async updateService(id, form) {
    const response = await apiRequest(`/admin/services/${id}`, { method: "PUT", body: buildFormData(form) });
    return mapService(response.data);
  },
  async toggleService(id, status) {
    const response = await apiRequest(
      `/admin/services/${id}/status${buildQuery({ active: toActive(status) })}`,
      { method: "PATCH" }
    );
    return mapService(response.data);
  },
  async deleteService(id) {
    return apiRequest(`/admin/services/${id}`, { method: "DELETE" });
  },
};
