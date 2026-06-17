// Auth service - UI calls these; implementation is backed by FastAPI.
// TODO: API INTEGRATION -> keep auth calls centralized here.
import { apiRequest } from "./api";

const normalizeAuth = (response) => {
  const data = response?.data || response;
  return {
    user: data.user,
    token: data.access_token,
    refreshToken: data.refresh_token,
    tokenType: data.token_type,
    expiresIn: data.expires_in,
  };
};

export const authService = {
  async login(email, password) {
    const response = await apiRequest("/auth/login", { method: "POST", body: { email, password } });
    return normalizeAuth(response);
  },
  async register(name, email, password) {
    const response = await apiRequest("/auth/register", { method: "POST", body: { name, email, password } });
    return normalizeAuth(response);
  },
  async refresh(refreshToken) {
    const response = await apiRequest("/auth/refresh", { method: "POST", body: { refresh_token: refreshToken }, skipAuthRefresh: true });
    return normalizeAuth(response);
  },
  async logout(refreshToken) {
    if (!refreshToken) return true;
    return apiRequest("/auth/logout", { method: "POST", body: { refresh_token: refreshToken } });
  },
  async me() {
    const response = await apiRequest("/auth/me");
    return response?.data || response;
  },
};
