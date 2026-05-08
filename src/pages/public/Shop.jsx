import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Search as SearchIcon, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import catLiquids from "@/assets/cat-liquids.png";
import catGloves from "@/assets/cat-gloves.png";
import catMasks from "@/assets/cat-masks.png";
import catCarkits from "@/assets/cat-carkits.png";

// TODO: API INTEGRATION -> GET /api/products?search=&category=&minPrice=&maxPrice=&tags=&sort=
const mockProducts = [
  { id: "1", name: "Premium Multi-Surface Cleaner Spray 500ml", category: "Cleaning Liquids", tags: ["new", "best"], price: 249, originalPrice: 499, image: catLiquids },
  { id: "2", name: "Heavy Duty Rubber Gloves – Reusable Pair", category: "Gloves", tags: ["best"], price: 149, originalPrice: 299, image: catGloves },
  { id: "3", name: "N95 Protective Mask – Pack of 10", category: "Masks & Safety", tags: ["sale"], price: 399, originalPrice: 599, image: catMasks },
  { id: "4", name: "Complete Car Cleaning Kit – 8 Piece Set", category: "Car Cleaning", tags: ["new"], price: 899, originalPrice: 1499, image: catCarkits },
  { id: "5", name: "Floor Cleaner Liquid – Lavender 1L", category: "Cleaning Liquids", tags: ["sale"], price: 199, originalPrice: 350, image: catLiquids },
  { id: "6", name: "Nitrile Gloves – Box of 100", category: "Gloves", tags: [], price: 549, originalPrice: 899, image: catGloves },
];

const categories = ["All", "Cleaning Liquids", "Gloves", "Masks & Safety", "Car Cleaning", "Cleaning Tools", "Kitchen Care"];
const allTags = ["new", "best", "sale"];
const sortOptions = ["Best Selling", "Price: Low to High", "Price: High to Low", "Newest"];
const PRICE_MAX = 2000;

const Shop = () => {
  const [params, setParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Best Selling");
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(params.get("search") || "");
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [activeTag, setActiveTag] = useState(params.get("filter") || "");

  useEffect(() => { setSearch(params.get("search") || ""); setActiveTag(params.get("filter") || ""); }, [params]);

  const filtered = useMemo(() => {
    let list = mockProducts.filter((p) => {
      if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (p.price > maxPrice) return false;
      if (activeTag && !p.tags.includes(activeTag)) return false;
      return true;
    });
    if (sortBy === "Price: Low to High") list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "Price: High to Low") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [selectedCategory, sortBy, search, maxPrice, activeTag]);

  const clearFilters = () => {
    setSelectedCategory("All"); setSearch(""); setMaxPrice(PRICE_MAX); setActiveTag("");
    setParams({});
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-6 sm:py-8 flex-1 w-full">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted">
              <SlidersHorizontal className="w-4 h-4" /> Filter
            </button>
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring self-start sm:self-auto">
            {sortOptions.map((opt) => <option key={opt}>{opt}</option>)}
          </select>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {showFilters && (
            <aside className="w-full lg:w-60 shrink-0 space-y-6 animate-fade-in">
              <div>
                <h3 className="font-display font-semibold text-foreground mb-3">Categories</h3>
                <ul className="space-y-1">
                  {categories.map((cat) => (
                    <li key={cat}>
                      <button onClick={() => setSelectedCategory(cat)}
                        className={`text-sm w-full text-left py-1 transition-colors ${selectedCategory === cat ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}>
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-3">Max Price: ₹{maxPrice}</h3>
                <input type="range" min={0} max={PRICE_MAX} step={50} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((t) => (
                    <button key={t} onClick={() => setActiveTag(activeTag === t ? "" : t)}
                      className={`px-3 py-1 rounded-full text-xs border transition-colors ${activeTag === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" /> Clear filters
              </button>
            </aside>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-4">{filtered.length} products found</p>
            {filtered.length === 0 ? (
              <EmptyState title="No products match your filters" message="Try adjusting search, price, or category." />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
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
