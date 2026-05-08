import { Trash2, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmptyState from "@/components/EmptyState";
import { useCart } from "@/store/CartContext";

const Cart = () => {
  const { items, total, updateQuantity, removeItem } = useCart();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-3xl flex-1 w-full">
        <h2 className="font-display font-bold text-2xl text-foreground mb-6">Shopping Cart</h2>

        {items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            message="Browse products and add them to your cart."
            action={<Link to="/shop" className="text-primary font-medium hover:underline">Continue Shopping →</Link>}
          />
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-md shrink-0 overflow-hidden">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground line-clamp-2">{item.name}</h3>
                      <p className="text-sm font-bold text-foreground mt-1">₹{item.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-muted"><Minus className="w-3 h-3" /></button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-muted"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-md"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <span className="font-display font-bold text-lg text-foreground">Total: ₹{total}</span>
              <Link to="/checkout" className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity text-center">
                Proceed to Checkout
              </Link>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
