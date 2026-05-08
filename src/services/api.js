// API client placeholder — central fetch wrapper used by feature services.
// Keeps inline `fetch` / business logic out of UI components.
import { storage, STORAGE_KEYS } from "./storage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export async function apiRequest(path, { method = "GET", body, headers = {} } = {}) {
  const token = storage.get(STORAGE_KEYS.AUTH_TOKEN);
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}`);
  return res.status === 204 ? null : res.json();
}
