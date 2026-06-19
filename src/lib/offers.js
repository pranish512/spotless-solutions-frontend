// Offers registry — promotional banner content for the customer header.
// Persisted to localStorage as a placeholder for backend API.
// TODO: API INTEGRATION -> /api/admin/offers (CRUD), /api/offers (public, enabled only)

const KEY = "offers:list";

const defaultOffers = [
  { id: "1", title: "Free shipping on orders over $49", description: "Secure checkout", enabled: true, order: 1 },
  { id: "2", title: "Need help?", description: "+1 (800) 555-CLEAN", enabled: true, order: 2 },
];

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(defaultOffers));
      return defaultOffers;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function write(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
  // notify same-tab listeners
  window.dispatchEvent(new Event("offers:updated"));
}

export const offersService = {
  list() {
    return read().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
  listEnabled() {
    return read()
      .filter((o) => o.enabled)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
  create(data) {
    const list = read();
    const next = { id: String(Date.now()), order: list.length + 1, enabled: true, ...data };
    write([...list, next]);
    return next;
  },
  update(id, data) {
    const list = read().map((o) => (o.id === id ? { ...o, ...data } : o));
    write(list);
  },
  remove(id) {
    write(read().filter((o) => o.id !== id));
  },
  toggle(id) {
    const list = read().map((o) => (o.id === id ? { ...o, enabled: !o.enabled } : o));
    write(list);
  },
};
