import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, Package, Sparkles } from "lucide-react";
import { searchService } from "@/services/searchService";

/**
 * Header search with a live, debounced autocomplete dropdown that returns
 * products + services (fuzzy, typo-tolerant). Self-contained — manages its own
 * query, results and open/close. `onNavigate` lets the parent close a drawer.
 */
const SearchBox = ({ className = "", onNavigate }) => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);

  // Debounced fetch (>= 2 chars).
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setProducts([]); setServices([]); setLoading(false); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const data = await searchService.search(term, 8);
        setProducts(data.products);
        setServices(data.services);
        setOpen(true);
      } catch {
        setProducts([]); setServices([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  // Close on outside click.
  useEffect(() => {
    const onDown = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (to) => {
    setOpen(false);
    setQ("");
    onNavigate?.();
    navigate(to);
  };

  const term = q.trim();
  const submit = (e) => {
    e.preventDefault();
    if (term) go(`/shop?search=${encodeURIComponent(term)}`);
  };
  const hasResults = products.length > 0 || services.length > 0;

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <form onSubmit={submit}>
        <div className="relative w-full">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => { if (term.length >= 2) setOpen(true); }}
            placeholder="Search products & services..."
            className="w-full h-11 pl-4 pr-12 rounded-lg border border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
            aria-label="Search products and services"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 h-9 w-10 flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            aria-label="Search"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </div>
      </form>

      {open && term.length >= 2 && (
        <div className="absolute left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-modal z-50 max-h-[75vh] overflow-y-auto">
          {!hasResults ? (
            <p className="p-4 text-sm text-muted-foreground text-center">
              {loading ? "Searching…" : `No matches for "${term}".`}
            </p>
          ) : (
            <>
              {products.length > 0 && (
                <div className="py-1">
                  <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Products</p>
                  {products.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => go(`/products/${p.slug}`)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted text-left transition-colors"
                    >
                      <span className="w-9 h-9 rounded-md bg-muted overflow-hidden flex items-center justify-center shrink-0">
                        {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-muted-foreground" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground truncate">{p.name}</span>
                        {p.category && <span className="block text-xs text-muted-foreground truncate">in {p.category}</span>}
                      </span>
                      {p.price != null && <span className="text-sm font-semibold text-foreground shrink-0">₹{p.price.toLocaleString("en-IN")}</span>}
                    </button>
                  ))}
                </div>
              )}
              {services.length > 0 && (
                <div className="py-1 border-t border-border">
                  <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Services</p>
                  {services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => go(`/services/${s.slug}`)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted text-left transition-colors"
                    >
                      <span className="w-9 h-9 rounded-md bg-primary/10 overflow-hidden flex items-center justify-center shrink-0">
                        {s.image ? <img src={s.image} alt="" className="w-full h-full object-cover" /> : <Sparkles className="w-4 h-4 text-primary" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground truncate">{s.name}</span>
                        <span className="block text-xs text-muted-foreground">Service</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => go(`/shop?search=${encodeURIComponent(term)}`)}
                className="w-full px-3 py-2.5 text-sm font-medium text-primary hover:bg-muted text-center border-t border-border transition-colors"
              >
                See all product results for "{term}"
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
