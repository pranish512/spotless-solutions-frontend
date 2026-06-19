// Reach Us — single-record content management.
// TODO: API INTEGRATION -> GET/PUT /api/admin/reach-us

const KEY = "content:reach-us";

export const reachUsService = {
  get() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { content: "" };
      return JSON.parse(raw);
    } catch {
      return { content: "" };
    }
  },
  save(data) {
    localStorage.setItem(KEY, JSON.stringify({ ...data, updatedAt: Date.now() }));
  },
};
