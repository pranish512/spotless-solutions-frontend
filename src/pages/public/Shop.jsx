import { useState } from "react";
import { SlidersHorizontal, Grid3X3, List } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import catLiquids from "@/assets/cat-liquids.png";
import catGloves from "@/assets/cat-gloves.png";
import catMasks from "@/assets/cat-masks.png";
import catCarkits from "@/assets/cat-carkits.png";

// TODO: API INTEGRATION -> GET /api/products?page=1&limit=20&category=&sort=&search= => { products[], totalCount, totalPages }
const mockProducts = [
  { id: "1", name: "Premium Multi-Surface Cleaner Spray 500ml", category: "Cleaning Liquids", price: 249, originalPrice: 499, image: catLiquids },
  { id: "2", name: "Heavy Duty Rubber Gloves – Reusable Pair", category: "Gloves", price: 149, originalPrice: 299, image: catGloves },
  { id: "3", name: "N95 Protective Mask – Pack of 10", category: "Masks & Safety", price: 399, originalPrice: 599, image: catMasks },
  { id: "4", name: "Complete Car Cleaning Kit – 8 Piece Set", category: "Car Cleaning", price: 899, originalPrice: 1499, image: catCarkits },
  { id: "5", name: "Floor Cleaner Liquid – Lavender 1L", category: "Cleaning Liquids", price: 199, originalPrice: 350, image: catLiquids },
  { id: "6", name: "Nitrile Gloves – Box of 100", category: "Gloves", price: 549, originalPrice: 899, image: catGloves },
];

const categories = ["All", "Cleaning Liquids", "Gloves", "Masks & Safety", "Car Cleaning", "Cleaning Tools", "Kitchen Care"];
const sortOptions = ["Best Selling", "Price: Low to High", "Price: High to Low", "Newest"];

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Best Selling");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = selectedCategory === "All"
    ? mockProducts
    : mockProducts.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {sortOptions.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          {showFilters && (
            <aside className="w-56 shrink-0 animate-slide-in">
              <h3 className="font-display font-semibold text-foreground mb-4">Product Categories</h3>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-sm w-full text-left py-1 transition-colors ${
                        selectedCategory === cat ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {/* Product grid */}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-4">{filtered.length} products found</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Shop;
