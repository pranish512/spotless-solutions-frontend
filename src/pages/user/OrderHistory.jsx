import { useState } from "react";
import { ChevronRight, Star, Package, Truck, CheckCircle2, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// TODO: API INTEGRATION -> GET /api/user/orders?page=1 => { orders: [{ id, date, total, status, items[], dispatchedAt, outForDeliveryAt, deliveredOn }], totalPages }
const initialOrders = [
  {
    id: "ORD-1001",
    date: "2026-04-20",
    total: 1247,
    status: "Delivered",
    dispatchedAt: "2026-04-21",
    outForDeliveryAt: "2026-04-23",
    deliveredOn: "2026-04-24",
    items: [
      { id: "p1", name: "Premium Multi-Surface Cleaner 500ml", image: "/placeholder.svg", quantity: 2 },
      { id: "p2", name: "Heavy Duty Rubber Gloves", image: "/placeholder.svg", quantity: 1 },
    ],
  },
  {
    id: "ORD-1002",
    date: "2026-04-26",
    total: 899,
    status: "Out for Delivery",
    dispatchedAt: "2026-04-27",
    outForDeliveryAt: "2026-04-29",
    deliveredOn: null,
    items: [
      { id: "p4", name: "Complete Car Cleaning Kit", image: "/placeholder.svg", quantity: 1 },
    ],
  },
];

const statusSteps = ["Dispatched", "Out for Delivery", "Delivered"];

const StatusBadge = ({ status }) => {
  const styles = {
    "Dispatched": "bg-primary/10 text-primary",
    "Out for Delivery": "bg-secondary text-secondary-foreground",
    "Delivered": "bg-accent text-accent-foreground",
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-md ${styles[status] || "bg-muted text-foreground"}`}>
      {status}
    </span>
  );
};

const OrderHistory = () => {
  const [orders] = useState(initialOrders);
  const [openOrder, setOpenOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const openDetails = (order) => {
    setOpenOrder(order);
    setRating(0);
    setComment("");
  };

  const submitRating = (e) => {
    e.preventDefault();
    // TODO: API INTEGRATION -> POST /api/orders/{orderId}/rating { rating, comment } => { success }
    setOpenOrder(null);
  };

  const getStepIndex = (status) => {
    if (status === "Delivered") return 2;
    if (status === "Out for Delivery") return 1;
    return 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="font-display font-bold text-2xl text-foreground mb-6">Order History</h2>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-card rounded-lg shadow-card p-5">
              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <div>
                  <p className="font-display font-bold text-foreground">#{order.id}</p>
                  <p className="text-xs text-muted-foreground">Placed on {order.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <p className="text-sm font-bold text-foreground">₹{order.total.toLocaleString()}</p>
                  <button
                    onClick={() => openDetails(order)}
                    className="p-2 rounded-md hover:bg-muted text-primary transition-colors"
                    aria-label="View details"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Items preview */}
              <div className="space-y-2 mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status flow */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between gap-2">
                  {statusSteps.map((step, i) => {
                    const reached = i <= getStepIndex(order.status);
                    const Icon = i === 0 ? Package : i === 1 ? Truck : CheckCircle2;
                    const dateLabel =
                      i === 0 ? order.dispatchedAt : i === 1 ? order.outForDeliveryAt : order.deliveredOn;
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center text-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center ${
                            reached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <p className={`text-xs mt-1 font-medium ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                          {step}
                          {step === "Delivered" && order.deliveredOn ? " on" : ""}
                        </p>
                        {dateLabel && reached && (
                          <p className="text-[10px] text-muted-foreground">{dateLabel}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Detail Modal */}
      {openOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setOpenOrder(null)}
        >
          <div
            className="bg-card rounded-xl shadow-modal w-full max-w-2xl p-6 my-8 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-xl text-foreground">Order #{openOrder.id}</h3>
                <p className="text-xs text-muted-foreground">Placed on {openOrder.date}</p>
              </div>
              <button onClick={() => setOpenOrder(null)} className="p-1 rounded-md hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <StatusBadge status={openOrder.status} />
            </div>

            <h4 className="font-display font-semibold text-foreground mb-2">Items</h4>
            <div className="space-y-2 mb-6">
              {openOrder.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Rating section */}
            <form onSubmit={submitRating} className="border-t border-border pt-4">
              <h4 className="font-display font-semibold text-foreground mb-3">Rate this order</h4>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1"
                    aria-label={`Rate ${n} stars`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        n <= (hoverRating || rating)
                          ? "fill-secondary text-secondary"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body resize-none"
              />
              <button
                type="submit"
                disabled={rating === 0}
                className="mt-3 px-6 h-11 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit Rating
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default OrderHistory;
