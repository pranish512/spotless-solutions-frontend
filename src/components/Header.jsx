import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingCart, User, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/store/CartContext";
import { offersService } from "@/lib/offers";

const navLinks = [
  { label: "New Arrivals", to: "/shop?filter=new" },
  { label: "Best Sellers", to: "/shop?filter=best" },
  { label: "On Sale", to: "/shop?filter=sale" },
  { label: "All Products", to: "/shop" },
  { label: "About", to: "/about" },
  { label: "Reach Us", to: "/reach-us" },
];

const Header = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { count: cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      {/* Trust strip */}
      <div className="bg-primary text-primary-foreground text-xs">
        <div className="container mx-auto px-4 py-1.5 flex items-center justify-center sm:justify-between gap-4">
          <span className="font-medium tracking-wide">Free shipping on orders over $49 · Secure checkout</span>
          <span className="hidden sm:inline opacity-80">Need help? +1 (800) 555-CLEAN</span>
        </div>
      </div>
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
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-4 pr-12 rounded-lg border border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
            />
            <button type="submit" className="absolute right-1 top-1 h-9 w-10 flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

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
          <form onSubmit={handleSearch} className="p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-4 pr-10 rounded-lg border border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
              />
              <button type="submit" className="absolute right-2 top-2">
                <Search className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </form>
          <div className="flex flex-col px-4 pb-4 gap-2">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.to} onClick={() => setMobileOpen(false)} className="py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
