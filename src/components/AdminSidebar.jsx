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
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard, screen: "dashboard" },
  { label: "Orders", to: "/admin/orders", icon: ShoppingBag, screen: "orders" },
  { label: "Products", to: "/admin/products", icon: Package, screen: "products" },
  { label: "Services", to: "/admin/services", icon: Sparkles, screen: "services" },
  { label: "Users", to: "/admin/users", icon: Users, screen: "users" },
  { label: "Staff", to: "/admin/staff", icon: Shield, screen: "staff" },
  { label: "Profile", to: "/admin/profile", icon: UserCircle, screen: "settings" },
];

// Masters group — lightweight configuration screens
const masterLinks = [
  { label: "User Type", to: "/admin/user-types", icon: UserCog, screen: "user_types" },
  { label: "Tags", to: "/admin/tags", icon: Tag, screen: "tags" },
  { label: "Branch", to: "/admin/branches", icon: Building2, screen: "branches" },
  { label: "Product Category", to: "/admin/categories", icon: FolderTree, screen: "categories" },
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
  const { logout, isAdmin, can } = useAuth();
  const [open, setOpen] = useState(false);
  const canView = (link) => isAdmin || !link.screen || can(link.screen, "read");
  const visibleTopLinks = topLinks.filter(canView);
  const visibleMasterLinks = masterLinks.filter(canView);

  const mastersActive = useMemo(
    () => visibleMasterLinks.some((l) => location.pathname === l.to),
    [location.pathname, visibleMasterLinks]
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
        {visibleTopLinks.map((link) => (
          <NavItem key={link.to} link={link} active={location.pathname === link.to} />
        ))}

        {visibleMasterLinks.length > 0 && (
          <Group label="Masters" icon={Library} items={visibleMasterLinks} active={mastersActive} open={mastersOpen} setOpen={setMastersOpen} />
        )}
        <Group label="Marketing" icon={Sparkles} items={marketingLinks} active={marketingActive} open={marketingOpen} setOpen={setMarketingOpen} />
        <Group label="Content Management" icon={FileText} items={contentLinks} active={contentActive} open={contentOpen} setOpen={setContentOpen} />
        <Group label="Policies" icon={ScrollText} items={policyLinks} active={policiesActive} open={policiesOpen} setOpen={setPoliciesOpen} />
      </nav>
      <div className="p-4 border-t border-nav-foreground/10 shrink-0">
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

      {/* Desktop sidebar — sticky full-height; inner nav scrolls if items overflow */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-nav text-nav-foreground self-start sticky top-0 h-screen">
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
