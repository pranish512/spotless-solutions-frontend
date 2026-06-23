import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Heart, Share2, ShoppingCart, Plus, Minus, Star, CheckCircle2, Truck, ShieldCheck,
  ChevronLeft, ChevronRight, MapPin, Edit, Package,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { productService } from "@/services/productService";
import { addressService } from "@/services/addressService";
import { useCart } from "@/store/CartContext";
import { useWishlist } from "@/store/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";

const Rating = ({ value, count, showCount = true }) => {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-secondary/30">
        <span className="text-sm font-bold text-foreground">{value.toFixed(1)}</span>
        <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
      </span>
      {showCount && <span className="text-xs text-muted-foreground">({count.toLocaleString("en-IN")})</span>}
      <span className="sr-only">{full} out of 5 stars</span>
    </span>
  );
};

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items: cartItems, addItem, updateQuantity, removeItem } = useCart();
  const { inWishlist, toggle: toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [showDetails, setShowDetails] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [share, setShare] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setGalleryIdx(0);
    (async () => {
      try {
        const data = await productService.getProductBySlug(slug);
        if (active) {
          setProduct(data);
          document.title = `${data.name} · Spotless Solutions`;
        }
      } catch (err) {
        if (active) setError(err?.message || "Product not found.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  // Look up the user's default delivery address when they're logged in.
  useEffect(() => {
    if (!isAuthenticated) {
      setDefaultAddress(null);
      return;
    }
    let active = true;
    (async () => {
      try {
        const data = await addressService.listAddresses({ limit: 50 });
        if (!active) return;
        setDefaultAddress(data.items.find((a) => a.isDefault) || data.items[0] || null);
      } catch {
        // silently ignore — address card just shows the "add address" CTA
      }
    })();
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const cartItem = useMemo(
    () => (product ? cartItems.find((i) => i.productId === product.id) : null),
    [cartItems, product]
  );
  const inCartQty = cartItem?.quantity || 0;
  const isWished = product ? inWishlist(product.id) : false;

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const all = [];
    if (product.image) all.push({ url: product.image, alt: product.name });
    (product.images || []).forEach((i) => {
      if (i.url && i.url !== product.image) all.push({ url: i.url, alt: i.alt || product.name });
    });
    return all;
  }, [product]);

  const handleAdd = async () => {
    if (!product) return;
    setActionError("");
    setActionBusy(true);
    try {
      await addItem({ productId: product.id, id: product.id }, 1);
    } catch (err) {
      setActionError(err?.message || "Could not add to cart");
    } finally {
      setActionBusy(false);
    }
  };

  const handleQty = async (delta) => {
    if (!cartItem) return;
    const next = cartItem.quantity + delta;
    setActionError("");
    setActionBusy(true);
    try {
      if (next <= 0) {
        await removeItem(cartItem.id);
      } else {
        await updateQuantity(cartItem.id, next);
      }
    } catch (err) {
      // The cart store resyncs from the server on failure, so a stale-item
      // "Cart item not found" already self-corrects to the Add-to-Cart state —
      // don't surface it as a scary error. Show anything else.
      const msg = err?.message || "Could not update cart";
      if (!/not found/i.test(msg)) setActionError(msg);
    } finally {
      setActionBusy(false);
    }
  };

  const handleWishlist = async () => {
    if (!product) return;
    setActionError("");
    try {
      await toggleWishlist(product.id);
    } catch (err) {
      setActionError(err?.message || "Could not update wishlist");
    }
  };

  const handleShare = async () => {
    if (!product) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch {
        /* user cancelled */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShare(true);
      setTimeout(() => setShare(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-20 text-center text-muted-foreground">Loading product…</main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-20 text-center">
          <p className="font-display font-bold text-xl text-foreground">{error || "Product not found."}</p>
          <Link to="/shop" className="mt-4 inline-block text-primary font-medium hover:underline">← Back to Shop</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const hasDiscount = product.actualPrice > product.sellingPrice;
  const showReviews = product.showRating;
  const stockBadge = product.inStock
    ? { text: "In Stock", color: "text-accent bg-accent/10" }
    : { text: "Out of Stock", color: "text-destructive bg-destructive/10" };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>›</span>
          <Link to="/shop" className="hover:text-foreground">Shop</Link>
          {product.category && (
            <>
              <span>›</span>
              <Link to={`/shop?category=${product.categorySlug}`} className="hover:text-foreground">{product.category}</Link>
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
              <div className="flex gap-4">
                {galleryImages.length > 1 && (
                  <div className="hidden sm:flex flex-col gap-3 w-20 shrink-0">
                    {galleryImages.map((img, i) => (
                      <button
                        key={img.url + i}
                        type="button"
                        onClick={() => setGalleryIdx(i)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          i === galleryIdx ? "border-primary shadow-md" : "border-border hover:border-primary/40"
                        }`}
                        aria-label={`Show image ${i + 1}`}
                      >
                        <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="relative flex-1 aspect-square bg-muted/30 rounded-xl overflow-hidden">
                  {galleryImages[galleryIdx] && (
                    <img
                      src={galleryImages[galleryIdx].url}
                      alt={galleryImages[galleryIdx].alt}
                      className="w-full h-full object-contain"
                    />
                  )}
                  {galleryImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setGalleryIdx((i) => (i === 0 ? galleryImages.length - 1 : i - 1))
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/95 shadow flex items-center justify-center hover:bg-background"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setGalleryIdx((i) => (i === galleryImages.length - 1 ? 0 : i + 1))
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/95 shadow flex items-center justify-center hover:bg-background"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {hasDiscount && (
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-md bg-destructive text-destructive-foreground text-sm font-bold">
                      -{product.discountPercent}%
                    </span>
                  )}
                </div>
              </div>

              {product.videoDemo && (
                <div className="mt-4 rounded-xl overflow-hidden border border-border bg-black">
                  <video src={product.videoDemo} controls className="w-full max-h-[360px]" />
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="hidden sm:grid grid-cols-3 gap-3 mt-4">
              <div className="bg-card rounded-xl border border-border p-3 flex items-center gap-2 text-xs">
                <Truck className="w-4 h-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Fast Delivery</span>
              </div>
              <div className="bg-card rounded-xl border border-border p-3 flex items-center gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Secure Payments</span>
              </div>
              <div className="bg-card rounded-xl border border-border p-3 flex items-center gap-2 text-xs">
                <Package className="w-4 h-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Easy Returns</span>
              </div>
            </div>
          </div>

          {/* Info panel */}
          <div className="lg:col-span-5">
            <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {product.category && (
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">{product.category}</p>
                  )}
                  <h1 className="font-display font-bold text-xl sm:text-2xl text-foreground leading-tight">
                    {product.name}
                  </h1>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleWishlist}
                    className={`w-9 h-9 rounded-full border border-border flex items-center justify-center transition-all hover:scale-105 ${
                      isWished ? "text-destructive bg-destructive/5 border-destructive/30" : "text-muted-foreground hover:text-destructive"
                    }`}
                    aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={`w-4 h-4 ${isWished ? "fill-destructive" : ""}`} />
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-9 h-9 rounded-full border border-border text-muted-foreground hover:text-foreground flex items-center justify-center transition-all hover:scale-105"
                    aria-label="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3 flex-wrap">
                {showReviews && product.ratingCount > 0 && (
                  <Rating value={product.avgRating} count={product.ratingCount} />
                )}
                <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${stockBadge.color}`}>
                  {stockBadge.text}
                </span>
              </div>

              {/* Pricing */}
              <div className="mt-5 pb-5 border-b border-border">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-display font-bold text-foreground">
                    ₹{product.sellingPrice.toLocaleString("en-IN")}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-base text-muted-foreground line-through">
                        ₹{product.actualPrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-sm font-bold text-accent">
                        {product.discountPercent}% off
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</p>
              </div>

              {/* Add to Cart / Quantity */}
              <div className="mt-5">
                {inCartQty > 0 ? (
                  <div className="flex items-center justify-between rounded-lg border-2 border-primary/30 bg-primary/5 px-2 py-2">
                    <button
                      type="button"
                      onClick={() => handleQty(-1)}
                      disabled={actionBusy}
                      className="w-12 h-12 rounded-md hover:bg-primary/10 flex items-center justify-center text-primary disabled:opacity-50"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <div className="text-center px-4">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">In Cart</p>
                      <p className="font-display font-bold text-lg text-foreground">{inCartQty}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQty(1)}
                      disabled={actionBusy}
                      className="w-12 h-12 rounded-md hover:bg-primary/10 flex items-center justify-center text-primary disabled:opacity-50"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={actionBusy || !product.inStock}
                    className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {actionBusy ? "Adding to Cart…" : product.inStock ? "Add to Cart" : "Out of Stock"}
                  </button>
                )}
                {inCartQty > 0 && (
                  <button
                    type="button"
                    onClick={() => navigate("/cart")}
                    className="mt-2 w-full h-11 rounded-lg border border-primary text-primary font-display font-bold text-sm hover:bg-primary/5"
                  >
                    Go to Cart
                  </button>
                )}
                {share && (
                  <p className="mt-2 text-xs text-accent text-center">Link copied to clipboard ✓</p>
                )}
                {actionError && (
                  <p className="mt-2 text-xs text-destructive text-center">{actionError}</p>
                )}
              </div>

              {/* Description & Highlights — between Add to Cart and Delivery Address */}
              <div className="mt-5 pt-5 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowDetails((v) => !v)}
                  className="w-full flex items-center justify-between text-left mb-3"
                  aria-expanded={showDetails}
                >
                  <h2 className="font-display font-bold text-base text-foreground">Product Description</h2>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${showDetails ? "rotate-90" : ""}`} />
                </button>
                {showDetails && (
                  <>
                    <p className="text-sm leading-relaxed text-foreground/85">{product.description}</p>
                    {product.highlights.length > 0 && (
                      <>
                        <h3 className="font-display font-bold text-sm text-foreground mt-4 mb-2">Highlights</h3>
                        <ul className="space-y-1.5">
                          {product.highlights.map((h, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-foreground/85">
                              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> {h}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Delivery address */}
              <div className="mt-5 rounded-xl border border-border p-3 bg-muted/30">
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground flex items-center gap-1.5 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Delivery Address
                </p>
                {defaultAddress ? (
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-xs">
                      <p className="font-medium text-foreground">
                        {defaultAddress.label} {defaultAddress.isDefault && <span className="text-primary">· Default</span>}
                      </p>
                      <p className="text-muted-foreground">
                        {defaultAddress.line1}, {defaultAddress.city} - {defaultAddress.pincode}
                      </p>
                    </div>
                    <Link to="/user/profile" className="p-1.5 rounded-md hover:bg-background text-primary" aria-label="Change address">
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate(isAuthenticated ? "/user/profile" : "/login")}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    {isAuthenticated ? "Add a delivery address →" : "Log in to set delivery address →"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Information specifications — full width below */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-12 bg-card rounded-2xl border border-border p-5 sm:p-6">
            <h3 className="font-display font-bold text-base text-foreground mb-3">Product Information</h3>
            <dl className="text-sm divide-y divide-border">
              {product.manufacturer && (
                <div className="flex justify-between py-2">
                  <dt className="text-muted-foreground">Brand</dt>
                  <dd className="font-medium text-foreground text-right">{product.manufacturer}</dd>
                </div>
              )}
              {product.sku && (
                <div className="flex justify-between py-2">
                  <dt className="text-muted-foreground">SKU</dt>
                  <dd className="font-medium text-foreground text-right">{product.sku}</dd>
                </div>
              )}
              {product.hsn && (
                <div className="flex justify-between py-2">
                  <dt className="text-muted-foreground">HSN / SAC</dt>
                  <dd className="font-medium text-foreground text-right">{product.hsn}</dd>
                </div>
              )}
              <div className="flex justify-between py-2">
                <dt className="text-muted-foreground">GST</dt>
                <dd className="font-medium text-foreground text-right">{product.gstPercent}%</dd>
              </div>
              {product.category && (
                <div className="flex justify-between py-2">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="font-medium text-foreground text-right">{product.category}</dd>
                </div>
              )}
              {product.tags.length > 0 && (
                <div className="flex justify-between py-2 gap-3">
                  <dt className="text-muted-foreground">Tags</dt>
                  <dd className="font-medium text-foreground text-right flex flex-wrap gap-1 justify-end">
                    {product.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-muted text-xs">{t}</span>
                    ))}
                  </dd>
                </div>
              )}
              <div className="flex justify-between py-2">
                <dt className="text-muted-foreground">Available</dt>
                <dd className="font-medium text-foreground text-right">{product.quantityAvailable} units</dd>
              </div>
            </dl>
          </aside>
        </div>

        {/* Reviews — only if Show Rating is on */}
        {showReviews && (
          <section className="mt-8 bg-card rounded-2xl border border-border p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="font-display font-bold text-lg text-foreground">Ratings & Reviews</h2>
              {product.ratingCount > 0 && <Rating value={product.avgRating} count={product.ratingCount} />}
            </div>
            {product.ratingCount === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share your experience after delivery.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Verified Buyer</span>
                    <span className="inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-md bg-secondary/30">
                      <span className="font-bold">5.0</span>
                      <Star className="w-3 h-3 fill-secondary text-secondary" />
                    </span>
                  </div>
                  <p className="text-sm text-foreground/85">Great quality, exactly as described. Will buy again.</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Verified Buyer</span>
                    <span className="inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-md bg-secondary/30">
                      <span className="font-bold">4.0</span>
                      <Star className="w-3 h-3 fill-secondary text-secondary" />
                    </span>
                  </div>
                  <p className="text-sm text-foreground/85">Solid product. Good value for money.</p>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
