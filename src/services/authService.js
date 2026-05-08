// Auth service — UI calls these; swap implementation when backend is wired.
// TODO: API INTEGRATION -> replace mock returns with apiRequest(...) calls.
import { apiRequest } from "./api";

export const authService = {
  async login(email, password) {
    // return apiRequest("/auth/login", { method: "POST", body: { email, password } });
    return {
      user: { id: "1", email, name: email.split("@")[0], role: email.includes("admin") ? "admin" : "customer" },
      token: "mock_token",
    };
  },
  async register(name, email, password) {
    // return apiRequest("/auth/register", { method: "POST", body: { name, email, password } });
    return { user: { id: "2", email, name, role: "customer" }, token: "mock_token" };
  },
  async logout() {
    // return apiRequest("/auth/logout", { method: "POST" });
    return true;
  },
  async me() {
    // return apiRequest("/auth/me");
    return null;
  },
};
