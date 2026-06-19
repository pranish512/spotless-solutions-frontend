// Customer address CRUD client.
import { apiRequest, buildQuery } from "./api";

const mapAddress = (a) => ({
  id: a.id,
  label: a.label || "",
  fullName: a.full_name || "",
  line1: a.line1 || "",
  line2: a.line2 || "",
  city: a.city || "",
  state: a.state || "",
  pincode: a.pincode || "",
  country: a.country || "India",
  phone: a.phone || "",
  isDefault: !!a.is_default,
});

const toPayload = (form) => ({
  label: form.label,
  full_name: form.fullName ?? form.full_name,
  line1: form.line1,
  line2: form.line2 || null,
  city: form.city,
  state: form.state,
  pincode: form.pincode,
  country: form.country || "India",
  phone: form.phone,
  is_default: !!form.isDefault,
});

const unwrap = (response) => response?.data || response || {};

export const addressService = {
  async listAddresses({ page = 1, limit = 50 } = {}) {
    const response = await apiRequest(`/user/addresses${buildQuery({ page, limit })}`);
    const items = (response?.items || []).map(mapAddress);
    return {
      total: response?.total || items.length,
      page: response?.page || page,
      limit: response?.limit || limit,
      items,
    };
  },

  async getAddress(id) {
    const response = await apiRequest(`/user/addresses/${id}`);
    return mapAddress(unwrap(response));
  },

  async createAddress(form) {
    const response = await apiRequest("/user/addresses", {
      method: "POST",
      body: toPayload(form),
    });
    return mapAddress(unwrap(response));
  },

  async updateAddress(id, form) {
    const response = await apiRequest(`/user/addresses/${id}`, {
      method: "PUT",
      body: toPayload(form),
    });
    return mapAddress(unwrap(response));
  },

  async setDefaultAddress(id) {
    const response = await apiRequest(`/user/addresses/${id}/default`, { method: "PATCH" });
    return mapAddress(unwrap(response));
  },

  async deleteAddress(id) {
    return apiRequest(`/user/addresses/${id}`, { method: "DELETE" });
  },
};
