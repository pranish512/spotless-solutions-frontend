import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authService } from "@/services/authService";
import { storage, STORAGE_KEYS } from "@/services/storage";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => storage.get(STORAGE_KEYS.AUTH_USER));
  const [loading, setLoading] = useState(false);

  // Persist session across refresh / re-login
  useEffect(() => {
    if (user) storage.set(STORAGE_KEYS.AUTH_USER, user);
    else storage.remove(STORAGE_KEYS.AUTH_USER);
  }, [user]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { user: u, token } = await authService.login(email, password);
      storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
      setUser(u);
      return u;
    } finally { setLoading(false); }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const { user: u, token } = await authService.register(name, email, password);
      storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
      setUser(u);
      return u;
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    setUser(null);
  }, []);

  const isAdmin = user?.role === "admin";
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
