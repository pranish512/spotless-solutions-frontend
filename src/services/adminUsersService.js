import { buildDefaultPermissions } from "@/lib/screens";
import { apiRequest, buildQuery } from "./api";

const toUiStatus = (status) => (status === "active" || status === true ? "Active" : "Inactive");
const toApiStatus = (status) => (status === "Active" ? "active" : "inactive");
const toActive = (status) => status === "Active";

const findByName = (items, name) => items.find((item) => item.name === name);
const findById = (items, id) => items.find((item) => String(item.id) === String(id));

const roleForUserType = (name) => {
  if (name === "Customer") return ["customer"];
  if (name === "Admin") return ["admin"];
  return ["staff"];
};

const permissionsToApi = (permissions = {}) =>
  Object.entries(permissions).map(([screen, value]) => ({
    screen,
    can_read: !!value.read,
    can_write: !!value.write,
    can_delete: !!value.delete,
  }));

const permissionsToUi = (permissions = []) => {
  const next = buildDefaultPermissions();
  permissions.forEach((permission) => {
    next[permission.screen] = {
      read: !!permission.can_read,
      write: !!permission.can_write,
      delete: !!permission.can_delete,
    };
  });
  return next;
};

const buildPayload = (form, refs = {}, isEditing = false) => {
  const userType = findByName(refs.userTypes || [], form.userType);
  const branch = findByName(refs.branches || [], form.branch);
  const payload = {
    name: form.name,
    email: form.email,
    phone: form.phone || null,
    profile_picture: form.profilePhoto || null,
    user_type_id: userType?.id || null,
    branch_id: branch?.id || null,
    responsibilities: form.description || null,
    status: toApiStatus(form.status),
    roles: roleForUserType(form.userType),
    permissions: permissionsToApi(form.permissions),
  };

  if (!isEditing || form.password) {
    payload.password = form.password;
  }

  return payload;
};

export const mapAdminUser = (item, refs = {}) => {
  const userType = findById(refs.userTypes || [], item.user_type_id);
  const branch = findById(refs.branches || [], item.branch_id);
  const role = item.roles?.includes("customer") ? "Customer" : item.roles?.includes("admin") ? "Admin" : "Store Manager";

  return {
    id: item.id,
    name: item.name || "",
    email: item.email || "",
    phone: item.phone || "",
    profilePhoto: item.profile_picture || "",
    userType: userType?.name || role,
    branch: branch?.name || "",
    description: item.responsibilities || "",
    status: toUiStatus(item.status),
    permissions: permissionsToUi(item.permissions),
    roles: item.roles || [],
  };
};

const unwrapList = (response) => ({
  total: response.total || 0,
  page: response.page || 1,
  limit: response.limit || 10,
  items: response.items || [],
});

export const adminUsersService = {
  async listUsers(params = {}, refs = {}) {
    const response = await apiRequest(`/admin/users${buildQuery({ page: 1, limit: 100, ...params })}`);
    const list = unwrapList(response);
    return { ...list, items: list.items.map((item) => mapAdminUser(item, refs)) };
  },
  async createUser(form, refs = {}) {
    const response = await apiRequest("/admin/users", {
      method: "POST",
      body: buildPayload(form, refs),
    });
    return mapAdminUser(response.data, refs);
  },
  async updateUser(id, form, refs = {}) {
    const response = await apiRequest(`/admin/users/${id}`, {
      method: "PUT",
      body: buildPayload(form, refs, true),
    });
    return mapAdminUser(response.data, refs);
  },
  async toggleUser(id, status, refs = {}) {
    const response = await apiRequest(`/admin/users/${id}/status${buildQuery({ active: toActive(status) })}`, { method: "PATCH" });
    return mapAdminUser(response.data, refs);
  },
  async deleteUser(id) {
    return apiRequest(`/admin/users/${id}`, { method: "DELETE" });
  },

  async listStaff(params = {}, refs = {}) {
    const response = await apiRequest(`/admin/staff${buildQuery({ page: 1, limit: 100, ...params })}`);
    const list = unwrapList(response);
    return { ...list, items: list.items.map((item) => mapAdminUser(item, refs)) };
  },
  async createStaff(form, refs = {}) {
    const response = await apiRequest("/admin/staff", {
      method: "POST",
      body: buildPayload(form, refs),
    });
    return mapAdminUser(response.data, refs);
  },
  async updateStaff(id, form, refs = {}) {
    const response = await apiRequest(`/admin/staff/${id}`, {
      method: "PUT",
      body: buildPayload(form, refs, true),
    });
    return mapAdminUser(response.data, refs);
  },
  async toggleStaff(id, status, refs = {}) {
    const response = await apiRequest(`/admin/staff/${id}/status${buildQuery({ active: toActive(status) })}`, { method: "PATCH" });
    return mapAdminUser(response.data, refs);
  },
  async deleteStaff(id) {
    return apiRequest(`/admin/staff/${id}`, { method: "DELETE" });
  },
};
