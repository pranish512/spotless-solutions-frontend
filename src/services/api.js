// API client — central fetch wrapper used by feature services.
// Keeps inline `fetch` / business logic out of UI components.
import { storage, STORAGE_KEYS } from "./storage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const SESSION_ID_KEY = "ss_session_id";

const isFormData = (body) => typeof FormData !== "undefined" && body instanceof FormData;

export function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

// Stable per-device identifier sent on every request. Used by the cart resolver
// on the backend for guest carts, and to merge guest cart → user cart on login.
export function getOrCreateSessionId() {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : `sid-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

// Convert backend image paths (e.g. "attachment/images/products/abc.jpg") into
// browser-loadable URLs. External URLs (Unsplash etc.) pass through unchanged.
export function resolveImageUrl(pathOrUrl) {
  if (!pathOrUrl) return "";
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  const origin = BASE_URL.replace(/\/api\/?$/, "");
  return `${origin}/${pathOrUrl.replace(/^\//, "")}`;
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
  const sessionId = getOrCreateSessionId();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(formData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(sessionId ? { "X-Session-Id": sessionId } : {}),
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
