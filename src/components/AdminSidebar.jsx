import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, FolderTree, Users, LogOut, Tag, UserCog, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Categories", to: "/admin/categories", icon: FolderTree },
  { label: "Tags", to: "/admin/tags", icon: Tag },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "User Types", to: "/admin/user-types", icon: UserCog },
  { label: "Staff", to: "/admin/staff", icon: Shield },
];

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-nav text-nav-foreground flex flex-col">
      <div className="p-6 border-b border-nav-foreground/10">
        <h2 className="font-display font-bold text-lg">Admin Panel</h2>
        <p className="text-xs text-nav-foreground/60">Spotless Solutions</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-nav-foreground/70 hover:bg-nav-foreground/10 hover:text-nav-foreground"
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-nav-foreground/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-nav-foreground/70 hover:bg-nav-foreground/10 hover:text-nav-foreground transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
