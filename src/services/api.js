// API client placeholder — central fetch wrapper used by feature services.
// Keeps inline `fetch` / business logic out of UI components.
import { storage, STORAGE_KEYS } from "./storage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const isFormData = (body) => typeof FormData !== "undefined" && body instanceof FormData;

export function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

async function refreshAccessToken() {
  const refreshToken = storage.get(STORAGE_KEYS.REFRESH_TOKEN);
  if (!refreshToken) return null;

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    return null;
  }

  const response = await res.json();
  const data = response?.data || response;
  if (data.access_token) storage.set(STORAGE_KEYS.AUTH_TOKEN, data.access_token);
  if (data.refresh_token) storage.set(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
  return data.access_token;
}

export async function apiRequest(path, { method = "GET", body, headers = {}, skipAuthRefresh = false } = {}) {
  const token = storage.get(STORAGE_KEYS.AUTH_TOKEN);
  const formData = isFormData(body);
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(formData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? (formData ? body : JSON.stringify(body)) : undefined,
  });

  if (res.status === 401 && !skipAuthRefresh) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      return apiRequest(path, { method, body, headers, skipAuthRefresh: true });
    }
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const message = typeof data === "object" ? data.message || data.error?.message : data;
    throw new Error(message || `API ${res.status} ${res.statusText}`);
  }

  return data;
}
