import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, User, Menu, X, LogOut, Package, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/store/CartContext";
import { useNavTags } from "@/hooks/useNavTags";
import SearchBox from "@/components/SearchBox";
import { offersService } from "@/lib/offers";

// "All Products" + Services/About/Reach Us are static. The tag links shown
// before them are dynamic (admin-controlled in Tags Management, max 3).
const STATIC_NAV_LINKS = [
  { label: "All Products", to: "/shop" },
  { label: "Services", to: "/services" },
  { label: "About", to: "/about" },
  { label: "Reach Us", to: "/reach-us" },
];

const Header = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { count: cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [offers, setOffers] = useState(() => offersService.listEnabled());
  const navTags = useNavTags();
  const navLinks = useMemo(
    () => [
      ...navTags.map((t) => ({ label: t.name, to: `/shop?tag=${encodeURIComponent(t.name)}` })),
      ...STATIC_NAV_LINKS,
    ],
    [navTags]
  );

  useEffect(() => {
    const sync = () => setOffers(offersService.listEnabled());
    window.addEventListener("offers:updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("offers:updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      {/* Promotional offers banner — dynamic, admin-managed, responsive */}
      {offers.length > 0 && (
        <div className="bg-primary text-primary-foreground text-xs">
          <div className="container mx-auto px-4 py-1.5 flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
            {offers.map((o) => (
              <span key={o.id} className="font-medium tracking-wide text-center break-words max-w-full">
                {o.title}
                {o.description ? <span className="opacity-80"> · {o.description}</span> : null}
              </span>
            ))}
          </div>
        </div>
      )}
      {/* Top bar */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="font-display font-bold text-primary-foreground text-sm">SS</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-display font-bold text-lg leading-tight text-foreground">Spotless Solutions</h1>
            <p className="text-xs text-muted-foreground">Clean Living, Simplified</p>
          </div>
        </Link>

        {/* Search */}
        <SearchBox className="hidden md:block flex-1 max-w-lg mx-8" onNavigate={() => setMobileOpen(false)} />

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-3">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin/dashboard" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Dashboard
                </Link>
              )}
              <Link to="/user/wishlist" className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground">
                <Heart className="w-5 h-5" />
              </Link>
              <Link to="/cart" className="p-2 rounded-lg hover:bg-muted transition-colors relative text-foreground">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full flex items-center justify-center">{cartCount}</span>
                )}
              </Link>
              <Link to="/user/profile" className="hidden sm:flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
                <User className="w-4 h-4" />
                <span>{user?.name}</span>
              </Link>
              <button onClick={logout} className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Login</span>
              </Link>
              <Link to="/cart" className="p-2 rounded-lg hover:bg-muted transition-colors relative text-foreground">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full flex items-center justify-center">{cartCount}</span>
                )}
              </Link>
            </>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors text-foreground">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav-bar hidden md:block">
        <div className="container mx-auto px-4 flex items-center gap-6 py-2">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.to} className="text-sm font-medium text-nav-foreground/80 hover:text-nav-foreground transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="p-4">
            <SearchBox onNavigate={() => setMobileOpen(false)} />
          </div>
          <div className="flex flex-col px-4 pb-2 gap-2">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.to} onClick={() => setMobileOpen(false)} className="py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Account section — keeps profile/logout reachable on mobile, where the
              top-bar user actions are hidden behind the sm: breakpoint. */}
          <div className="flex flex-col px-4 pb-4 pt-3 gap-1 border-t border-border">
            {isAuthenticated ? (
              <>
                {user?.name && (
                  <div className="flex items-center gap-2 py-2 text-sm font-semibold text-foreground">
                    <User className="w-4 h-4" /> {user.name}
                  </div>
                )}
                {isAdmin && (
                  <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2 text-sm font-medium text-primary hover:underline">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                )}
                <Link to="/user/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                  <User className="w-4 h-4" /> My Profile
                </Link>
                <Link to="/user/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                  <Package className="w-4 h-4" /> My Orders
                </Link>
                <Link to="/user/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                  <Heart className="w-4 h-4" /> Wishlist
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); logout(); }}
                  className="flex items-center gap-2 py-2 text-sm font-medium text-destructive hover:opacity-80 transition-opacity text-left"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                  <User className="w-4 h-4" /> Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="py-2 text-sm font-medium text-primary hover:underline">
                  Create an account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
