// Storage layer — wraps localStorage / sessionStorage with safe JSON helpers.
// All persistence (cart, auth tokens, session) goes through here so swapping
// to cookies / IndexedDB later is a one-file change.

const safeParse = (raw, fallback) => {
  try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
};

export const storage = {
  get(key, fallback = null) {
    if (typeof window === "undefined") return fallback;
    return safeParse(window.localStorage.getItem(key), fallback);
  },
  set(key, value) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },
};

export const session = {
  get: (k, f = null) => safeParse(window.sessionStorage.getItem(k), f),
  set: (k, v) => window.sessionStorage.setItem(k, JSON.stringify(v)),
  remove: (k) => window.sessionStorage.removeItem(k),
};

export const STORAGE_KEYS = {
  AUTH_USER: "ss_auth_user",
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  CART: "ss_cart",
};
