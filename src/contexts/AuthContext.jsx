import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authService } from "@/services/authService";
import { storage, STORAGE_KEYS } from "@/services/storage";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const hasRole = (user, role) => (user?.roles || []).includes(role);

const hasPermissionValue = (user, screen, action = "read") => {
  if (hasRole(user, "admin")) return true;
  const permission = (user?.permissions || []).find((item) => item.screen === screen);
  return Boolean(permission?.[`can_${action}`]);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => storage.get(STORAGE_KEYS.AUTH_USER));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) storage.set(STORAGE_KEYS.AUTH_USER, user);
    else storage.remove(STORAGE_KEYS.AUTH_USER);
  }, [user]);

  useEffect(() => {
    const token = storage.get(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return;

    let active = true;
    setLoading(true);
    authService
      .me()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        storage.remove(STORAGE_KEYS.AUTH_TOKEN);
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const notifyAuthChanged = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth:changed"));
    }
  };

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { user: u, token, refreshToken } = await authService.login(email, password);
      storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
      if (refreshToken) storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      setUser(u);
      notifyAuthChanged();
      return u;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const { user: u, token, refreshToken } = await authService.register(name, email, password);
      storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
      if (refreshToken) storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      setUser(u);
      notifyAuthChanged();
      return u;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = storage.get(STORAGE_KEYS.REFRESH_TOKEN);
    try {
      await authService.logout(refreshToken);
    } finally {
      storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      setUser(null);
      notifyAuthChanged();
    }
  }, []);

  const isAdmin = hasRole(user, "admin");
  const isStaff = hasRole(user, "staff");
  const isAuthenticated = !!user;
  const can = useCallback((screen, action = "read") => hasPermissionValue(user, screen, action), [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isStaff, isAuthenticated, hasRole: (role) => hasRole(user, role), can }}>
      {children}
    </AuthContext.Provider>
  );
};
