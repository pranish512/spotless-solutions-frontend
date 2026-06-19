import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryCircle from "@/components/CategoryCircle";
import ProductCard from "@/components/ProductCard";
import heroBanner from "@/assets/hero-cleaning-services.jpg";
import catLiquids from "@/assets/cat-liquids.png";
import catGloves from "@/assets/cat-gloves.png";
import catMasks from "@/assets/cat-masks.png";
import catCarkits from "@/assets/cat-carkits.png";
import catTools from "@/assets/cat-tools.png";
import catKitchen from "@/assets/cat-kitchen.png";
import { productService } from "@/services/productService";

// Category icons stay local (branding); slug matches backend category slugs.
const categories = [
  { name: "Cleaning Liquids", image: catLiquids, slug: "cleaning-liquids" },
  { name: "Gloves", image: catGloves, slug: "gloves" },
  { name: "Masks & Safety", image: catMasks, slug: "masks-safety" },
  { name: "Car Cleaning", image: catCarkits, slug: "car-cleaning" },
  { name: "Cleaning Tools", image: catTools, slug: "cleaning-tools" },
  { name: "Kitchen Care", image: catKitchen, slug: "kitchen-care" },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await productService.listProducts({ featured: true, limit: 8 });
        if (active) setProducts(data.items);
      } catch (err) {
        if (active) setError(err?.message || "Unable to load products");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="relative h-[440px] md:h-[540px] overflow-hidden">
        <img
          src={heroBanner}
          alt="Professional Spotless Solutions cleaning crew servicing a corporate lobby"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/60 to-transparent flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-xl animate-fade-in">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
                Trusted Cleaning Partner
              </span>
              <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-background leading-tight mb-5">
                Spotless Spaces,<br />Healthier Living
              </h1>
              <p className="text-background/85 text-base md:text-lg mb-7 leading-relaxed">
                Premium cleaning supplies and professional hygiene services trusted by homes, offices and industries — delivered with quality, safety and care.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Shop Supplies
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-background/10 backdrop-blur border border-background/30 text-background font-display font-bold text-sm hover:bg-background/20 transition-colors"
                >
                  Explore Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="font-display font-bold text-2xl text-foreground mb-8 text-center">Shop by Category</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {categories.map((cat) => (
            <CategoryCircle key={cat.slug} {...cat} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-bold text-2xl text-foreground">Featured Products</h2>
          <Link to="/shop" className="text-sm font-medium text-primary hover:underline">View All →</Link>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading products…</p>
        ) : error ? (
          <p className="text-sm text-destructive text-center py-8">{error}</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No products yet. Admin can add them via Product Management.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Home;
