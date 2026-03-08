import Header from "@/components/Header";
import Footer from "@/components/Footer";

const OrderTracking = () => {
  // TODO: API INTEGRATION -> GET /api/orders/{orderId}/tracking => { status, steps[], estimatedDelivery }
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <h2 className="font-display font-bold text-2xl text-foreground mb-6">Track Order</h2>
        <div className="space-y-4">
          <input placeholder="Enter Order ID" className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body" />
          <button className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity">
            Track
          </button>
        </div>
        <div className="mt-8 p-6 rounded-lg border border-border bg-card">
          <p className="text-muted-foreground text-sm text-center">Enter an order ID to see tracking details</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderTracking;
