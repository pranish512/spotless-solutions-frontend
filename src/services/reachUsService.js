// Reach Us (single contact record) API client — read + in-place update (no delete).
import { apiRequest } from "./api";

const unwrap = (r) => r?.data || r || {};
const mapReachUs = (d) => ({
  email: d?.email || "",
  phone: d?.phone || "",
  availability: d?.availability || "",
  location: d?.location || "",
});

export const reachUsService = {
  async getPublic() {
    return mapReachUs(unwrap(await apiRequest("/reach-us")));
  },
  async getAdmin() {
    return mapReachUs(unwrap(await apiRequest("/admin/reach-us")));
  },
  async update(fields) {
    const response = await apiRequest("/admin/reach-us", {
      method: "PUT",
      body: {
        email: fields.email ?? "",
        phone: fields.phone ?? "",
        availability: fields.availability ?? "",
        location: fields.location ?? "",
      },
    });
    return mapReachUs(unwrap(response));
  },
};
