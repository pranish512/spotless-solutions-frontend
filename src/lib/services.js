// Services module helpers — no static data; everything lives in the backend now.
// TODO: API INTEGRATION -> services data is fetched live from the FastAPI backend
// via the public /api/services and admin /api/admin/services endpoints.

const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const makeServiceSlug = slugify;
