import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const screenByPath = {
  "/admin/dashboard": "dashboard",
  "/admin/orders": "orders",
  "/admin/products": "products",
  "/admin/categories": "categories",
  "/admin/users": "users",
  "/admin/staff": "staff",
  "/admin/tags": "tags",
  "/admin/user-types": "user_types",
  "/admin/branches": "branches",
  "/admin/profile": "settings",
};

const resolveScreen = (pathname) => {
  if (pathname.startsWith("/admin/policies")) return "settings";
  if (pathname.startsWith("/admin/marketing")) return "settings";
  if (pathname.startsWith("/admin/content")) return "settings";
  return screenByPath[pathname];
};

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isStaff, can } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin) {
    const screen = resolveScreen(location.pathname);
    const allowed = isAdmin || (isStaff && screen && can(screen, "read"));
    if (!allowed) return <Navigate to="/" replace />;
  }

  return children;
};
