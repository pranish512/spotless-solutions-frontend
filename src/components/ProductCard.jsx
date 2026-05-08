import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/store/CartContext";

const ProductCard = ({ product }) => {
  const { items, addItem } = useCart();
  const inCart = items.some((i) => i.id === product.id);
  const hasDiscount = product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card group">
      <div className="relative aspect-square bg-muted overflow-hidden">
        <img src={product.image} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        {hasDiscount && <span className="badge-sale absolute top-3 right-3">-{discountPercent}%</span>}
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
        <h3 className="font-body font-medium text-foreground text-sm leading-snug mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          {hasDiscount && <span className="price-original">₹{product.originalPrice}</span>}
          <span className={hasDiscount ? "price-sale" : "font-bold text-lg text-foreground"}>₹{product.price}</span>
        </div>
        <button
          onClick={() => addItem(product, 1)}
          className="w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          {inCart ? <><Check className="w-4 h-4" /> Added</> : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
