import { Trash2, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// TODO: API INTEGRATION -> GET /api/cart => { items: [{ productId, name, price, quantity, image }], total }
const mockCart = [
  { id: "1", name: "Premium Multi-Surface Cleaner Spray 500ml", price: 249, quantity: 2, image: "" },
  { id: "2", name: "Heavy Duty Rubber Gloves – Reusable Pair", price: 149, quantity: 1, image: "" },
];

const Cart = () => {
  const total = mockCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h2 className="font-display font-bold text-2xl text-foreground mb-6">Shopping Cart</h2>

        {mockCart.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Link to="/shop" className="text-primary font-medium hover:underline">Continue Shopping →</Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {mockCart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card">
                  <div className="w-20 h-20 bg-muted rounded-md shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">{item.name}</h3>
                    <p className="text-sm font-bold text-foreground mt-1">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* TODO: API INTEGRATION -> PATCH /api/cart/{itemId} { quantity } */}
                    <button className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-muted text-foreground"><Minus className="w-3 h-3" /></button>
                    <span className="text-sm font-medium text-foreground w-6 text-center">{item.quantity}</span>
                    <button className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-muted text-foreground"><Plus className="w-3 h-3" /></button>
                  </div>
                  {/* TODO: API INTEGRATION -> DELETE /api/cart/{itemId} */}
                  <button className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 flex items-center justify-between">
              <span className="font-display font-bold text-lg text-foreground">Total: ₹{total}</span>
              <Link to="/checkout" className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity">
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
