import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Checkout = () => {
  // TODO: API INTEGRATION -> POST /api/orders { items, shippingAddress, paymentMethod } => { orderId, status }
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h2 className="font-display font-bold text-2xl text-foreground mb-6">Checkout</h2>

        <form className="space-y-6">
          <fieldset className="space-y-4">
            <legend className="font-display font-semibold text-foreground mb-2">Shipping Address</legend>
            <input placeholder="Full Name" className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body" />
            <input placeholder="Address Line 1" className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body" />
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="City" className="h-11 px-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body" />
              <input placeholder="PIN Code" className="h-11 px-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body" />
            </div>
            <input placeholder="Phone Number" className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body" />
          </fieldset>

          {/* TODO: API INTEGRATION -> POST /api/payments/initiate { orderId, method } => { paymentUrl } */}
          <button type="submit" className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-display font-bold hover:opacity-90 transition-opacity">
            Place Order
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
