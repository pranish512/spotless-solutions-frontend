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

const categories = [
  { name: "Cleaning Liquids", image: catLiquids, slug: "liquids" },
  { name: "Gloves", image: catGloves, slug: "gloves" },
  { name: "Masks & Safety", image: catMasks, slug: "masks" },
  { name: "Car Cleaning", image: catCarkits, slug: "car-kits" },
  { name: "Cleaning Tools", image: catTools, slug: "tools" },
  { name: "Kitchen Care", image: catKitchen, slug: "kitchen" },
];

// TODO: API INTEGRATION -> GET /api/products?featured=true => { products[] }
const featuredProducts = [
  { id: "1", name: "Premium Multi-Surface Cleaner Spray 500ml", category: "Cleaning Liquids", price: 249, originalPrice: 499, image: catLiquids },
  { id: "2", name: "Heavy Duty Rubber Gloves – Reusable Pair", category: "Gloves", price: 149, originalPrice: 299, image: catGloves },
  { id: "3", name: "N95 Protective Mask – Pack of 10", category: "Masks & Safety", price: 399, originalPrice: 599, image: catMasks },
  { id: "4", name: "Complete Car Cleaning Kit – 8 Piece Set", category: "Car Cleaning", price: 899, originalPrice: 1499, image: catCarkits },
  { id: "5", name: "Microfiber Mop with Extendable Handle", category: "Cleaning Tools", price: 599, originalPrice: 999, image: catTools },
  { id: "6", name: "Kitchen Degreaser Spray – Lemon Fresh 750ml", category: "Kitchen Care", price: 199, originalPrice: 349, image: catKitchen },
  { id: "7", name: "Glass & Window Cleaning Liquid 1L", category: "Cleaning Liquids", price: 179, originalPrice: 350, image: catLiquids },
  { id: "8", name: "Eco-Friendly Sponge Set – Pack of 6", category: "Kitchen Care", price: 129, originalPrice: 249, image: catKitchen },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="relative h-[400px] md:h-[480px] overflow-hidden">
        <img src={heroBanner} alt="Cleaning supplies" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/50 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-lg animate-fade-in">
              <h2 className="font-display font-extrabold text-4xl md:text-5xl text-background leading-tight mb-4">
                Spotless Home,<br />Happy Life
              </h2>
              <p className="text-background/80 text-lg mb-6">Premium cleaning supplies at wholesale prices. Up to 50% off on all categories.</p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Shop Now
              </Link>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
