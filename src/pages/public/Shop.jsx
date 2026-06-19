import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Search as SearchIcon, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import { productService } from "@/services/productService";
import { filterSampleProducts } from "@/lib/sampleProducts";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Best Rated", value: "rating" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

const PRICE_MAX = 2000;

const Shop = () => {
  const [params, setParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategorySlug, setSelectedCategorySlug] = useState(params.get("category") || "");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(params.get("search") || "");
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [activeTag, setActiveTag] = useState(params.get("tag") || "");

  // One-time load: categories + tags
  useEffect(() => {
    (async () => {
      try {
        const [cats, tags] = await Promise.all([
          productService.listCategories(),
          productService.listTags(),
        ]);
        setCategoriesList(cats);
        setTagsList(tags);
      } catch {
        /* leave lists empty; page still works on raw products */
      }
    })();
  }, []);

  // Sync URL params → state
  useEffect(() => {
    setSearch(params.get("search") || "");
    setActiveTag(params.get("tag") || "");
    setSelectedCategorySlug(params.get("category") || "");
  }, [params]);

  // Fetch products when filters change (debounced for search)
  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      setError("");
      const filterArgs = {
        search: search || undefined,
        category: selectedCategorySlug || undefined,
        tag: activeTag || undefined,
        max_price: maxPrice < PRICE_MAX ? maxPrice : undefined,
        sort: sortBy,
      };
      try {
        const data = await productService.listProducts({ ...filterArgs, limit: 50 });
        // DEV-ONLY fallback: if backend returns no items, show sample products
        // so the page is never blank during development.
        // TODO: Remove this fallback once real products exist.
        if (!data.items || data.items.length === 0) {
          setProducts(filterSampleProducts(filterArgs));
        } else {
          setProducts(data.items);
        }
      } catch (err) {
        // DEV-ONLY fallback on API error (e.g. backend not running).
        console.warn("[Shop] Falling back to sample products:", err?.message);
        setProducts(filterSampleProducts(filterArgs));
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [search, selectedCategorySlug, activeTag, maxPrice, sortBy]);

  const clearFilters = () => {
    setSelectedCategorySlug("");
    setSearch("");
    setMaxPrice(PRICE_MAX);
    setActiveTag("");
    setParams({});
  };

  const categoryOptions = useMemo(
    () => [{ name: "All", slug: "" }, ...categoriesList.map((c) => ({ name: c.name, slug: c.slug }))],
    [categoriesList]
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-6 sm:py-8 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filter
            </button>
            <div className="relative flex-1 min-w-[120px] sm:min-w-[180px] max-w-sm">
              <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring self-start sm:self-auto"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {showFilters && (
            <aside className="w-full lg:w-60 shrink-0 space-y-6 animate-fade-in">
              <div>
                <h3 className="font-display font-semibold text-foreground mb-3">Categories</h3>
                <ul className="space-y-1">
                  {categoryOptions.map((cat) => (
                    <li key={cat.slug || "all"}>
                      <button
                        onClick={() => setSelectedCategorySlug(cat.slug)}
                        className={`text-sm w-full text-left py-1 transition-colors ${
                          selectedCategorySlug === cat.slug
                            ? "text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-3">Max Price: ₹{maxPrice.toLocaleString("en-IN")}</h3>
                <input
                  type="range"
                  min={0}
                  max={PRICE_MAX}
                  step={50}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              {tagsList.length > 0 && (
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tagsList.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTag(activeTag === t.name ? "" : t.name)}
                        className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                          activeTag === t.name
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border hover:bg-muted"
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" /> Clear filters
              </button>
            </aside>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-4">
              {loading ? "Loading…" : `${products.length} products found`}
            </p>
            {error && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
            )}
            {loading ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Loading products…</p>
            ) : products.length === 0 ? (
              <EmptyState title="No products match your filters" message="Try adjusting search, price, or category." />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Shop;
