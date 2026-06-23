import { useLayoutEffect, useMemo, useRef, useState } from "react";
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

// Module-level so they keep a stable identity across re-renders (defining them
// inside the component remounts the whole nav on every render, losing scroll).
const NavItem = ({ link, active, onNavigate }) => (
  <Link
    to={link.to}
    onClick={onNavigate}
    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors min-w-0 ${
      active
        ? "bg-primary text-primary-foreground"
        : "text-nav-foreground/70 hover:bg-nav-foreground/10 hover:text-nav-foreground"
    }`}
  >
    <link.icon className="w-4 h-4 shrink-0" />
    <span className="truncate">{link.label}</span>
  </Link>
);

const Group = ({ label, icon: Icon, items, active, open, onToggle, currentPath, onNavigate }) => (
  <div className="pt-2">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors min-w-0 ${
        active ? "text-nav-foreground" : "text-nav-foreground/70 hover:bg-nav-foreground/10 hover:text-nav-foreground"
      }`}
    >
      <span className="flex items-center gap-3 min-w-0">
        <Icon className="w-4 h-4 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
      {open ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
    </button>
    {open && (
      <div className="mt-1 ml-3 pl-3 border-l border-nav-foreground/10 space-y-1">
        {items.map((link) => (
          <NavItem key={link.to} link={link} active={currentPath === link.to} onNavigate={onNavigate} />
        ))}
      </div>
    )}
  </div>
);

// Remembers the desktop nav scroll position across the per-page remount of the
// sidebar, so navigating from a bottom item doesn't jump the sidebar to the top.
let savedNavScroll = 0;

const AdminSidebar = () => {
  const location = useLocation();
  const { logout, isAdmin, can, user } = useAuth();
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);

  // Title reflects the signed-in user: "Admin Panel" for admins, otherwise their
  // user type — e.g. "Store Manager Panel", "Order Manager Panel".
  const panelLabel = isAdmin
    ? "Admin Panel"
    : user?.user_type?.name
    ? `${user.user_type.name} Panel`
    : "Admin Panel";

  const canView = (link) => isAdmin || !link.screen || can(link.screen, "read");
  const visibleTopLinks = topLinks.filter(canView);
  const visibleMasterLinks = masterLinks.filter(canView);

  const mastersActive = useMemo(
    () => visibleMasterLinks.some((l) => location.pathname === l.to),
    [location.pathname, visibleMasterLinks]
  );
  const policiesActive = useMemo(() => policyLinks.some((l) => location.pathname === l.to), [location.pathname]);
  const marketingActive = useMemo(() => marketingLinks.some((l) => location.pathname === l.to), [location.pathname]);
  const contentActive = useMemo(() => contentLinks.some((l) => location.pathname === l.to), [location.pathname]);

  const [mastersOpen, setMastersOpen] = useState(mastersActive);
  const [policiesOpen, setPoliciesOpen] = useState(policiesActive);
  const [marketingOpen, setMarketingOpen] = useState(marketingActive);
  const [contentOpen, setContentOpen] = useState(contentActive);

  // Restore the saved scroll position before paint (no flicker) after a remount.
  useLayoutEffect(() => {
    const el = navRef.current;
    if (el) el.scrollTop = savedNavScroll;
  }, []);

  const closeDrawer = () => setOpen(false);

  // Called inline (not <SidebarBody/>) so the markup is part of this component's
  // tree — the <nav> persists across re-renders and keeps its scroll on group toggles.
  const renderBody = ({ withScrollMemory } = {}) => (
    <div className="flex h-full w-full min-w-0 flex-col">
      <div className="p-6 border-b border-nav-foreground/10 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-display font-bold text-lg truncate">{panelLabel}</h2>
          <p className="text-xs text-nav-foreground/60 truncate">Spotless Solutions</p>
        </div>
        <button
          className="lg:hidden p-1 rounded-md hover:bg-nav-foreground/10 shrink-0"
          onClick={closeDrawer}
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav
        ref={withScrollMemory ? navRef : undefined}
        onScroll={withScrollMemory ? (e) => { savedNavScroll = e.currentTarget.scrollTop; } : undefined}
        className="flex-1 p-4 space-y-1 overflow-y-auto overscroll-contain"
      >
        {visibleTopLinks.map((link) => (
          <NavItem key={link.to} link={link} active={location.pathname === link.to} onNavigate={closeDrawer} />
        ))}

        {visibleMasterLinks.length > 0 && (
          <Group label="Masters" icon={Library} items={visibleMasterLinks} active={mastersActive} open={mastersOpen} onToggle={() => setMastersOpen((v) => !v)} currentPath={location.pathname} onNavigate={closeDrawer} />
        )}
        <Group label="Marketing" icon={Sparkles} items={marketingLinks} active={marketingActive} open={marketingOpen} onToggle={() => setMarketingOpen((v) => !v)} currentPath={location.pathname} onNavigate={closeDrawer} />
        <Group label="Content Management" icon={FileText} items={contentLinks} active={contentActive} open={contentOpen} onToggle={() => setContentOpen((v) => !v)} currentPath={location.pathname} onNavigate={closeDrawer} />
        <Group label="Policies" icon={ScrollText} items={policyLinks} active={policiesActive} open={policiesOpen} onToggle={() => setPoliciesOpen((v) => !v)} currentPath={location.pathname} onNavigate={closeDrawer} />
      </nav>
      <div className="p-4 border-t border-nav-foreground/10 shrink-0">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-nav-foreground/70 hover:bg-nav-foreground/10 hover:text-nav-foreground transition-colors w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
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
        <h2 className="font-display font-bold text-base">{panelLabel}</h2>
        <span className="w-9" />
      </div>

      {/* Desktop sidebar — the dark column fills the full page height (no white gap
          above/below); an inner sticky, viewport-tall wrapper keeps the nav in view. */}
      <aside className="hidden lg:block w-72 shrink-0 bg-nav text-nav-foreground">
        <div className="sticky top-0 h-screen">
          {renderBody({ withScrollMemory: true })}
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={closeDrawer} />
          <aside className="relative w-72 max-w-[80%] h-full bg-nav text-nav-foreground shadow-xl animate-slide-in">
            {renderBody()}
          </aside>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
