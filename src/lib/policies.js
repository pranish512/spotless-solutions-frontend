// Policies registry — single source of truth for the fixed policy slugs, their
// titles, and public paths. Content + images now live in the backend; the API
// client is in src/services/policiesService.js.

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

export const MAX_ABOUT_IMAGES = 10;
