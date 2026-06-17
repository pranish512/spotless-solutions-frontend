// Services master — local placeholder store for the Services module.
// Persists to localStorage as a stand-in for the backend.
// TODO: API INTEGRATION -> GET /api/admin/services => [{ id, slug, name, description, image, brochureName, brochureUrl, status }]

const STORAGE_KEY = "spotless.services";

const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const DEFAULT_SERVICES = [
  {
    id: "svc-1",
    slug: "integrated-hygiene-solutions",
    name: "Integrated Hygiene Solutions",
    description:
      "End-to-end campus maintenance combining trained manpower, modern equipment and a structured pre-work schedule to keep your facility spotless, safe and audit-ready every day.",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
    brochureName: "integrated-hygiene-solutions.pdf",
    brochureUrl: "",
    status: "Active",
  },
  {
    id: "svc-2",
    slug: "manpower-cleaning-services",
    name: "Manpower Cleaning Services",
    description:
      "Skilled, unskilled and production-support manpower trained in hygiene protocols, safety standards and customer etiquette — delivered at the scale your operation needs.",
    image:
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=1200&q=80",
    brochureName: "manpower-services.pdf",
    brochureUrl: "",
    status: "Active",
  },
  {
    id: "svc-3",
    slug: "deep-cleaning-services",
    name: "Deep Cleaning Services",
    description:
      "Periodic deep cleaning of floors, restrooms, glass facades and high-touch areas using hospital-grade chemicals and certified equipment for a visibly transformed environment.",
    image:
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=80",
    brochureName: "deep-cleaning.pdf",
    brochureUrl: "",
    status: "Active",
  },
];

export const loadServices = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return DEFAULT_SERVICES;
};

export const saveServices = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (_) {}
};

export const getActiveServices = () =>
  loadServices().filter((s) => s.status === "Active");

export const getServiceBySlug = (slug) =>
  loadServices().find((s) => s.slug === slug);

export const makeServiceSlug = slugify;
