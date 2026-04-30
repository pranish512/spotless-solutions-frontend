import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, FolderTree, Users, LogOut, Tag, UserCog,
  Shield, ShoppingBag, UserCircle, Menu, X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Orders", to: "/admin/orders", icon: ShoppingBag },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Categories", to: "/admin/categories", icon: FolderTree },
  { label: "Tags", to: "/admin/tags", icon: Tag },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "User Types", to: "/admin/user-types", icon: UserCog },
  { label: "Staff", to: "/admin/staff", icon: Shield },
  { label: "Profile", to: "/admin/profile", icon: UserCircle },
];

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const SidebarBody = () => (
    <div className="flex h-full flex-col">
      <div className="p-6 border-b border-nav-foreground/10 flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg">Admin Panel</h2>
          <p className="text-xs text-nav-foreground/60">Spotless Solutions</p>
        </div>
        <button
          className="lg:hidden p-1 rounded-md hover:bg-nav-foreground/10"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-nav-foreground/70 hover:bg-nav-foreground/10 hover:text-nav-foreground"
              }`}
            >
              <link.icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{link.label}</span>
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
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-nav text-nav-foreground">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md hover:bg-nav-foreground/10"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="font-display font-bold text-base">Admin Panel</h2>
        <span className="w-9" />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 min-h-screen bg-nav text-nav-foreground">
        <SidebarBody />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="relative w-72 max-w-[80%] h-full bg-nav text-nav-foreground shadow-xl animate-slide-in">
            <SidebarBody />
          </aside>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
