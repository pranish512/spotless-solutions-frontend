import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, FolderTree, Users, LogOut, Tag, UserCog,
  Shield, ShoppingBag, UserCircle, Menu, X, Library, Building2, ChevronDown, ChevronRight,
  ScrollText, Cookie, Info, Ban, CreditCard, Megaphone, FileText, MapPin, Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Top-level (non-master) entries
const topLinks = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Orders", to: "/admin/orders", icon: ShoppingBag },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Staff", to: "/admin/staff", icon: Shield },
  { label: "Profile", to: "/admin/profile", icon: UserCircle },
];

// Masters group — lightweight configuration screens
const masterLinks = [
  { label: "User Type", to: "/admin/user-types", icon: UserCog },
  { label: "Tags", to: "/admin/tags", icon: Tag },
  { label: "Branch", to: "/admin/branches", icon: Building2 },
  { label: "Product Category", to: "/admin/categories", icon: FolderTree },
];

// Policies group — single-record content pages
const policyLinks = [
  { label: "Cookies Policy", to: "/admin/policies/cookies-policy", icon: Cookie },
  { label: "About Us", to: "/admin/policies/about-us", icon: Info },
  { label: "Order Cancellation Policy", to: "/admin/policies/order-cancellation-policy", icon: Ban },
  { label: "Payment and Security", to: "/admin/policies/payment-and-security", icon: CreditCard },
];

// Marketing group
const marketingLinks = [
  { label: "Offers", to: "/admin/marketing/offers", icon: Megaphone },
];

// Content Management group
const contentLinks = [
  { label: "Reach Us", to: "/admin/content/reach-us", icon: MapPin },
];

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const mastersActive = useMemo(
    () => masterLinks.some((l) => location.pathname === l.to),
    [location.pathname]
  );
  const policiesActive = useMemo(
    () => policyLinks.some((l) => location.pathname === l.to),
    [location.pathname]
  );
  const marketingActive = useMemo(
    () => marketingLinks.some((l) => location.pathname === l.to),
    [location.pathname]
  );
  const contentActive = useMemo(
    () => contentLinks.some((l) => location.pathname === l.to),
    [location.pathname]
  );
  const [mastersOpen, setMastersOpen] = useState(mastersActive);
  const [policiesOpen, setPoliciesOpen] = useState(policiesActive);
  const [marketingOpen, setMarketingOpen] = useState(marketingActive);
  const [contentOpen, setContentOpen] = useState(contentActive);

  const Group = ({ label, icon: Icon, items, active, open: groupOpen, setOpen: setGroupOpen }) => (
    <div className="pt-2">
      <button
        type="button"
        onClick={() => setGroupOpen((v) => !v)}
        aria-expanded={groupOpen}
        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          active ? "text-nav-foreground" : "text-nav-foreground/70 hover:bg-nav-foreground/10 hover:text-nav-foreground"
        }`}
      >
        <span className="flex items-center gap-3">
          <Icon className="w-4 h-4 shrink-0" />
          <span className="truncate">{label}</span>
        </span>
        {groupOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {groupOpen && (
        <div className="mt-1 ml-3 pl-3 border-l border-nav-foreground/10 space-y-1">
          {items.map((link) => (
            <NavItem key={link.to} link={link} active={location.pathname === link.to} />
          ))}
        </div>
      )}
    </div>
  );

  const NavItem = ({ link, active }) => (
    <Link
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
        {topLinks.map((link) => (
          <NavItem key={link.to} link={link} active={location.pathname === link.to} />
        ))}

        {/* Masters group */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setMastersOpen((v) => !v)}
            aria-expanded={mastersOpen}
            className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              mastersActive
                ? "text-nav-foreground"
                : "text-nav-foreground/70 hover:bg-nav-foreground/10 hover:text-nav-foreground"
            }`}
          >
            <span className="flex items-center gap-3">
              <Library className="w-4 h-4 shrink-0" />
              <span className="truncate">Masters</span>
            </span>
            {mastersOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {mastersOpen && (
            <div className="mt-1 ml-3 pl-3 border-l border-nav-foreground/10 space-y-1">
              {masterLinks.map((link) => (
                <NavItem key={link.to} link={link} active={location.pathname === link.to} />
              ))}
            </div>
          )}
        </div>

        {/* Policies group */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setPoliciesOpen((v) => !v)}
            aria-expanded={policiesOpen}
            className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              policiesActive
                ? "text-nav-foreground"
                : "text-nav-foreground/70 hover:bg-nav-foreground/10 hover:text-nav-foreground"
            }`}
          >
            <span className="flex items-center gap-3">
              <ScrollText className="w-4 h-4 shrink-0" />
              <span className="truncate">Policies</span>
            </span>
            {policiesOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {policiesOpen && (
            <div className="mt-1 ml-3 pl-3 border-l border-nav-foreground/10 space-y-1">
              {policyLinks.map((link) => (
                <NavItem key={link.to} link={link} active={location.pathname === link.to} />
              ))}
            </div>
          )}
        </div>
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
