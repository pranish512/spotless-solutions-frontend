import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Plus, Minus } from "lucide-react";
import { useCart } from "@/store/CartContext";
import { useWishlist } from "@/store/WishlistContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { items, addItem, updateQuantity } = useCart();
  const { inWishlist, toggle: toggleWishlist } = useWishlist();

  const [busy, setBusy] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [error, setError] = useState("");

  // Accept both legacy mock shape (originalPrice/price) and API shape (actualPrice/sellingPrice).
  const productId = product.id;
  const slug = product.slug;
  const name = product.name;
  const category = product.category || "";
  const image = product.image;
  const sellingPrice = product.sellingPrice ?? product.price ?? 0;
  const actualPrice = product.actualPrice ?? product.originalPrice ?? 0;

  // Prefer the discount % entered in Product Creation; fall back to the
  // computed price-difference percentage when only prices are set.
  const computedDiscount =
    actualPrice > sellingPrice
      ? Math.round(((actualPrice - sellingPrice) / actualPrice) * 100)
      : 0;
  const discountPercent =
    product.discountPercent && product.discountPercent > 0
      ? product.discountPercent
      : computedDiscount;
  const hasDiscount = discountPercent > 0 && actualPrice > sellingPrice;
  const savings = hasDiscount ? actualPrice - sellingPrice : 0;
  const isWished = inWishlist(productId);

  const cartItem = items.find((i) => i.productId === productId);
  const inCartQty = cartItem?.quantity || 0;

  const goToDetail = () => {
    if (slug) navigate(`/products/${slug}`);
  };

  const handleAdd = async (e) => {
    e?.stopPropagation?.();
    setError("");
    setBusy(true);
    try {
      await addItem({ productId, id: productId }, 1);
    } catch (err) {
      setError(err?.message || "Could not add to cart");
    } finally {
      setBusy(false);
    }
  };

  const handleQty = async (delta, e) => {
    e?.stopPropagation?.();
    if (!cartItem) return;
    setError("");
    setBusy(true);
    try {
      await updateQuantity(cartItem.id, cartItem.quantity + delta);
    } catch (err) {
      setError(err?.message || "Could not update quantity");
    } finally {
      setBusy(false);
    }
  };

  // Heart sits OUTSIDE the navigation Link, so clicking it only toggles the
  // wishlist — it never triggers the product-detail navigation.
  const handleWishlist = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setError("");
    setWishBusy(true);
    try {
      await toggleWishlist(productId);
    } catch (err) {
      setError(err?.message || "Could not update wishlist");
    } finally {
      setWishBusy(false);
    }
  };

  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden shadow-card hover:shadow-lg transition-all">
      {/* Image area with overlay controls */}
      <div className="relative">
        {/* Only the image is the Link target → clicking the heart never navigates */}
        <Link
          to={slug ? `/products/${slug}` : "#"}
          onClick={(e) => !slug && e.preventDefault()}
          className="block aspect-square bg-muted overflow-hidden"
          aria-label={`View ${name}`}
        >
          {image && (
            <img
              src={image}
              alt={name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
        </Link>

        {/* Wishlist heart — sibling of Link, not a child */}
        <button
          type="button"
          onClick={handleWishlist}
          disabled={wishBusy}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-background/95 backdrop-blur shadow-md flex items-center justify-center transition-all hover:scale-110 disabled:opacity-60 ${
            isWished ? "text-destructive" : "text-muted-foreground hover:text-destructive"
          }`}
          aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${isWished ? "fill-destructive" : ""}`} />
        </button>

        {/* Sale badge — stacked directly under the heart */}
        {hasDiscount && (
          <span className="absolute top-14 right-3 px-2 py-0.5 rounded-md bg-destructive text-destructive-foreground text-xs font-bold leading-none shadow-md">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {category && (
          <p className="text-xs text-muted-foreground mb-1 truncate">{category}</p>
        )}
        <h3
          onClick={goToDetail}
          className="font-body font-medium text-foreground text-sm leading-snug mb-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors min-h-[2.5em]"
        >
          {name}
        </h3>

        {/* Price line — strikethrough actual + sale */}
        <div className="flex items-baseline gap-2 mb-1.5">
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{actualPrice.toLocaleString("en-IN")}
            </span>
          )}
          <span className="font-bold text-lg text-destructive">
            ₹{sellingPrice.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Final-amount confirmation — what the customer actually pays */}
        <div className="mb-3 flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-muted/60 border border-border/60">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Total</span>
          <span className="text-sm font-display font-bold text-foreground">
            ₹{sellingPrice.toLocaleString("en-IN")}
            {hasDiscount && (
              <span className="ml-1.5 text-[10px] font-normal text-accent">
                save ₹{savings.toLocaleString("en-IN")}
              </span>
            )}
          </span>
        </div>

        {inCartQty > 0 ? (
          <div className="flex items-center justify-between gap-1 rounded-md border border-primary/30 bg-primary/5 p-0.5">
            <button
              type="button"
              onClick={(e) => handleQty(-1, e)}
              disabled={busy}
              className="w-9 h-9 rounded hover:bg-primary/10 flex items-center justify-center disabled:opacity-50 text-primary"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-foreground min-w-[2ch] text-center">
              {inCartQty}
            </span>
            <button
              type="button"
              onClick={(e) => handleQty(1, e)}
              disabled={busy}
              className="w-9 h-9 rounded hover:bg-primary/10 flex items-center justify-center disabled:opacity-50 text-primary"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            disabled={busy}
            className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {busy ? (
              "Adding…"
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </>
            )}
          </button>
        )}

        {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}
      </div>
    </div>
  );
};

export default ProductCard;
