import { useState } from "react";
import { Search, Package, Truck, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { orderService } from "@/services/orderService";

const STEPS = [
  { key: "pending",         label: "Order Placed",     icon: Package },
  { key: "confirmed",       label: "Confirmed",        icon: CheckCircle2 },
  { key: "accepted",        label: "Accepted",         icon: CheckCircle2 },
  { key: "processing",      label: "Processing",       icon: Package },
  { key: "dispatched",      label: "Dispatched",       icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered",       label: "Delivered",        icon: CheckCircle2 },
];

const stepIndex = (status) => STEPS.findIndex((s) => s.key === status);

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
};

const OrderTracking = () => {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e) => {
    e?.preventDefault?.();
    setError("");
    setOrder(null);
    if (!query.trim()) {
      setError("Please enter an order ID or order number.");
      return;
    }
    setLoading(true);
    try {
      // The backend accepts the UUID id; if the user typed an ORD-XXXX number,
      // we fall back to scanning their order list.
      let found = null;
      try {
        found = await orderService.getMyOrder(query.trim());
      } catch {
        const list = await orderService.listMyOrders({ limit: 100 });
        found = list.items.find(
          (o) => o.orderNumber.toLowerCase() === query.trim().toLowerCase()
        );
      }
      if (!found) {
        setError("Order not found in your account.");
      } else {
        setOrder(found);
      }
    } catch (err) {
      setError(err?.message || "Unable to look up order.");
    } finally {
      setLoading(false);
    }
  };

  const isTerminal =
    order && ["cancelled", "rejected", "refunded"].includes(order.status);
  const currentIdx = order ? stepIndex(order.status) : -1;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h2 className="font-display font-bold text-2xl text-foreground mb-6">Track Order</h2>

        <form onSubmit={handleTrack} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Order number (ORD-XXXXXXXX) or order ID"
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 h-11 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Looking…" : "Track"}
          </button>
        </form>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        {!order && !error && (
          <div className="mt-4 p-6 rounded-lg border border-border bg-card">
            <p className="text-muted-foreground text-sm text-center">Enter an order ID to see tracking details.</p>
          </div>
        )}

        {order && (
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                <div>
                  <p className="font-display font-bold text-foreground">#{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">Placed on {fmtDate(order.placedAt)}</p>
                </div>
                <p className="text-sm font-bold text-foreground">₹{order.grandTotal.toLocaleString("en-IN")}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {order.expectedDeliveryAt
                  ? `Expected delivery: ${fmtDate(order.expectedDeliveryAt)}`
                  : "Delivery estimate not available yet."}
              </p>
            </div>

            {isTerminal ? (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-5">
                <p className="font-display font-bold text-destructive">Order {order.status}</p>
                {order.statusHistory?.length > 0 && (
                  <p className="text-sm text-foreground mt-1">
                    {order.statusHistory[order.statusHistory.length - 1]?.note}
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="space-y-4">
                  {STEPS.map((step, i) => {
                    const reached = i <= currentIdx;
                    const Icon = step.icon;
                    const history = order.statusHistory?.find((h) => h.toStatus === step.key);
                    return (
                      <div key={step.key} className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            reached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <p className={`text-sm font-display font-bold ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                          </p>
                          {history?.created_at && (
                            <p className="text-[11px] text-muted-foreground">{fmtDate(history.created_at)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {order.shippingAddress && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h4 className="font-display font-semibold text-foreground mb-2 text-sm">Delivery Address</h4>
                <p className="text-sm text-foreground">{order.shippingAddress.fullName}</p>
                <p className="text-sm text-muted-foreground">{order.shippingAddress.line1}</p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
                <p className="text-sm text-muted-foreground">📞 {order.shippingAddress.phone}</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default OrderTracking;
