import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    // TODO: API INTEGRATION -> POST /api/auth/login { email, password } => { user, token, role }
    setLoading(true);
    try {
      // Simulated response for development
      const mockUser = {
        id: "1",
        email,
        name: email.split("@")[0],
        role: email.includes("admin") ? "admin" : "customer",
      };
      setUser(mockUser);
      localStorage.setItem("auth_token", "mock_token");
      return mockUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    // TODO: API INTEGRATION -> POST /api/auth/register { name, email, password } => { user, token }
    setLoading(true);
    try {
      const mockUser = { id: "2", email, name, role: "customer" };
      setUser(mockUser);
      localStorage.setItem("auth_token", "mock_token");
      return mockUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    // TODO: API INTEGRATION -> POST /api/auth/logout
    setUser(null);
    localStorage.removeItem("auth_token");
  }, []);

  const isAdmin = user?.role === "admin";
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
