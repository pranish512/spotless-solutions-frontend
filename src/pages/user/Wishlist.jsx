import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import { wishlistService } from "@/services/wishlistService";
import { useCart } from "@/store/CartContext";

const Wishlist = () => {
  const { addItem } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyProductId, setBusyProductId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await wishlistService.listWishlist({ limit: 50 });
      setItems(data.items);
    } catch (err) {
      setError(err?.message || "Unable to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (productId) => {
    setBusyProductId(productId);
    try {
      await wishlistService.removeFromWishlist(productId);
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    } catch (err) {
      setError(err?.message || "Unable to remove item");
    } finally {
      setBusyProductId(null);
    }
  };

  const handleMoveToCart = async (item) => {
    setBusyProductId(item.productId);
    try {
      await addItem({ productId: item.productId, id: item.productId }, 1);
      await wishlistService.removeFromWishlist(item.productId);
      setItems((prev) => prev.filter((i) => i.productId !== item.productId));
    } catch (err) {
      setError(err?.message || "Unable to move item to cart");
    } finally {
      setBusyProductId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h2 className="font-display font-bold text-2xl text-foreground mb-6 flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary" /> My Wishlist
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading wishlist…</p>
        ) : items.length === 0 ? (
          <EmptyState
            title="Your wishlist is empty"
            message="Browse products and add your favorites!"
            action={<Link to="/shop" className="text-primary font-medium hover:underline">Browse products →</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const busy = busyProductId === item.productId;
              const hasDiscount = item.originalPrice > 0 && item.originalPrice > item.price;
              return (
                <div key={item.id} className="bg-card rounded-lg shadow-card overflow-hidden border border-border flex flex-col">
                  <Link to={`/shop?product=${item.productId}`} className="aspect-square bg-muted overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                    )}
                  </Link>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1">{item.name}</h3>
                    {!item.active && (
                      <p className="text-[10px] uppercase tracking-wider text-destructive mb-1">Currently unavailable</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 mb-3">
                      <span className="text-base font-bold text-foreground">₹{item.price.toLocaleString("en-IN")}</span>
                      {hasDiscount && (
                        <span className="text-xs text-muted-foreground line-through">₹{item.originalPrice.toLocaleString("en-IN")}</span>
                      )}
                    </div>
                    <div className="mt-auto flex gap-2">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        disabled={busy || !item.active}
                        className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 rounded-md bg-primary text-primary-foreground text-xs font-display font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        disabled={busy}
                        className="h-10 px-3 inline-flex items-center justify-center rounded-md border border-destructive/40 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
