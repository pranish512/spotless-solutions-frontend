import { Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

// TODO: API INTEGRATION -> GET /api/user/wishlist => { products[] }

const Wishlist = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h2 className="font-display font-bold text-2xl text-foreground mb-6 flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary" /> My Wishlist
        </h2>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Your wishlist is empty. Browse products and add your favorites!</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
