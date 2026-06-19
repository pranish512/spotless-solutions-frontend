// Policies registry — single source of truth for policy slugs + defaults.
// Persisted to localStorage as a placeholder for backend API.
// TODO: API INTEGRATION -> GET/PUT /api/admin/policies/{slug}

export const POLICY_DEFS = {
  "cookies-policy": {
    slug: "cookies-policy",
    title: "Cookies Policy",
    publicPath: "/policies/cookies",
  },
  "about-us": {
    slug: "about-us",
    title: "About Us",
    publicPath: "/about",
  },
  "order-cancellation-policy": {
    slug: "order-cancellation-policy",
    title: "Order Cancellation Policy",
    publicPath: "/policies/order-cancellation",
  },
  "payment-and-security": {
    slug: "payment-and-security",
    title: "Payment and Security",
    publicPath: "/policies/payment-security",
  },
};

const KEY = (slug) => `policy:${slug}`;
const IMG_KEY = "policy:about-us:images";

export const policiesService = {
  get(slug) {
    try {
      const raw = localStorage.getItem(KEY(slug));
      if (!raw) return { content: "" };
      return JSON.parse(raw);
    } catch {
      return { content: "" };
    }
  },
  save(slug, data) {
    localStorage.setItem(KEY(slug), JSON.stringify({ ...data, updatedAt: Date.now() }));
  },
  getAboutImages() {
    try {
      return JSON.parse(localStorage.getItem(IMG_KEY) || "[]");
    } catch {
      return [];
    }
  },
  saveAboutImages(images) {
    localStorage.setItem(IMG_KEY, JSON.stringify(images.slice(0, 10)));
  },
};

export const MAX_ABOUT_IMAGES = 10;
