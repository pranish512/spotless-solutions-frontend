import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Package, Truck, CheckCircle2, X, Ban, AlertTriangle, FileDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import { orderService } from "@/services/orderService";
import { storage, STORAGE_KEYS } from "@/services/storage";

const STATUS_STEPS = [
  { key: "dispatched", label: "Dispatched", icon: Package },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const STATUS_INDEX = {
  pending: -1,
  confirmed: -1,
  accepted: -1,
  processing: -1,
  dispatched: 0,
  out_for_delivery: 1,
  delivered: 2,
};

const STATUS_LABEL = {
  pending: "Pending",
  confirmed: "Confirmed",
  accepted: "Accepted",
  processing: "Processing",
  dispatched: "Dispatched",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  rejected: "Rejected",
  refunded: "Refunded",
};

const STATUS_STYLE = {
  pending: "bg-muted text-foreground",
  confirmed: "bg-secondary/30 text-foreground",
  accepted: "bg-secondary/40 text-foreground",
  processing: "bg-secondary/50 text-foreground",
  dispatched: "bg-primary/10 text-primary",
  out_for_delivery: "bg-secondary text-secondary-foreground",
  delivered: "bg-accent/20 text-accent",
  cancelled: "bg-destructive/10 text-destructive",
  rejected: "bg-destructive/15 text-destructive",
  refunded: "bg-accent/15 text-accent",
};

const StatusBadge = ({ status }) => (
  <span className={`px-2 py-1 text-xs font-semibold rounded-md ${STATUS_STYLE[status] || "bg-muted text-foreground"}`}>
    {STATUS_LABEL[status] || status}
  </span>
);

const CANCELLABLE = new Set(["pending", "confirmed", "accepted", "processing"]);

const fmtDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openOrder, setOpenOrder] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await orderService.listMyOrders({ limit: 50 });
      setOrders(data.items);
    } catch (err) {
      setError(err?.message || "Unable to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitCancel = async () => {
    if (!confirmCancelId) return;
    const reason = cancelReason.trim() || "Cancelled by customer";
    try {
      const updated = await orderService.cancelMyOrder(confirmCancelId, reason);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      setError(err?.message || "Unable to cancel order");
    } finally {
      setConfirmCancelId(null);
      setCancelReason("");
    }
  };

  const openInvoiceTab = (orderId) => {
    // The invoice endpoint requires a Bearer token. Open in a new tab — the
    // backend serves it with Content-Disposition: inline so the browser can
    // print to PDF. Browsers won't send our Bearer token automatically, so
    // we pass it via a short-lived token query string isn't supported by the
    // backend. Easiest: open and rely on cookies if present, else copy the URL.
    const token = storage.get(STORAGE_KEYS.AUTH_TOKEN);
    const url = orderService.invoiceUrl(orderId);
    if (!token) {
      window.open(url, "_blank");
      return;
    }
    // Fetch the HTML with auth header, blob it, open in tab.
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.text())
      .then((html) => {
        const blob = new Blob([html], { type: "text/html" });
        const objUrl = URL.createObjectURL(blob);
        window.open(objUrl, "_blank");
        // Revoke after 1 min — tab keeps its copy
        setTimeout(() => URL.revokeObjectURL(objUrl), 60000);
      })
      .catch(() => window.open(url, "_blank"));
  };

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt)),
    [orders]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="font-display font-bold text-2xl text-foreground mb-6">Order History</h2>

        {error && <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading orders…</p>
        ) : sortedOrders.length === 0 ? (
          <EmptyState title="No orders yet" message="Your placed orders will appear here." />
        ) : (
          <div className="space-y-4">
            {sortedOrders.map((order) => {
              const isTerminal = ["cancelled", "rejected", "refunded"].includes(order.status);
              const canCancel = CANCELLABLE.has(order.status);
              const stepIdx = STATUS_INDEX[order.status] ?? -1;

              return (
                <div key={order.id} className="bg-card rounded-lg shadow-card p-5">
                  <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                    <div>
                      <p className="font-display font-bold text-foreground">#{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">Placed on {fmtDate(order.placedAt)}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <StatusBadge status={order.status} />
                      <p className="text-sm font-bold text-foreground">₹{order.grandTotal.toLocaleString("en-IN")}</p>
                      {canCancel && (
                        <button
                          onClick={() => setConfirmCancelId(order.id)}
                          className="inline-flex items-center gap-1 px-3 h-8 rounded-md border border-destructive/40 text-destructive text-xs font-display font-bold hover:bg-destructive/10 transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5" /> Cancel
                        </button>
                      )}
                      <button
                        onClick={() => openInvoiceTab(order.id)}
                        className="inline-flex items-center gap-1 px-3 h-8 rounded-md border border-border text-foreground text-xs font-display font-bold hover:bg-muted transition-colors"
                        title="Open invoice in a new tab"
                      >
                        <FileDown className="w-3.5 h-3.5" /> Invoice
                      </button>
                      <button
                        onClick={() => setOpenOrder(order)}
                        className="p-2 rounded-md hover:bg-muted text-primary transition-colors"
                        aria-label="View details"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity} · ₹{item.unitPrice.toLocaleString("en-IN")} each</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-muted-foreground">+ {order.items.length - 3} more item(s)</p>
                    )}
                  </div>

                  {isTerminal && (
                    <div className="bg-destructive/10 rounded-md p-3 mb-3 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-destructive">{STATUS_LABEL[order.status]}</p>
                        {order.statusHistory?.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {order.statusHistory[order.statusHistory.length - 1]?.note}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {!isTerminal && stepIdx >= 0 && (
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between gap-2">
                        {STATUS_STEPS.map((step, i) => {
                          const reached = i <= stepIdx;
                          const Icon = step.icon;
                          return (
                            <div key={step.key} className="flex-1 flex flex-col items-center text-center">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                                  reached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <p className={`text-xs mt-1 font-medium ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                                {step.label}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {openOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setOpenOrder(null)}>
          <div className="bg-card rounded-xl shadow-modal w-full max-w-2xl p-6 my-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-xl text-foreground">Order #{openOrder.orderNumber}</h3>
                <p className="text-xs text-muted-foreground">Placed on {fmtDate(openOrder.placedAt)}</p>
              </div>
              <button onClick={() => setOpenOrder(null)} className="p-1 rounded-md hover:bg-muted" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <StatusBadge status={openOrder.status} />
            </div>

            <h4 className="font-display font-semibold text-foreground mb-2">Items</h4>
            <div className="space-y-2 mb-6">
              {openOrder.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">Qty {item.quantity} · ₹{item.unitPrice.toLocaleString("en-IN")} each</p>
                  </div>
                  <p className="text-sm font-medium text-foreground shrink-0">₹{item.lineTotal.toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{openOrder.subtotal.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">GST</span><span>₹{openOrder.taxTotal.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between font-display font-bold text-lg pt-1"><span>Total</span><span className="text-primary">₹{openOrder.grandTotal.toLocaleString("en-IN")}</span></div>
            </div>

            {openOrder.shippingAddress && (
              <div className="mt-4 border-t border-border pt-4">
                <h4 className="font-display font-semibold text-foreground mb-2 text-sm">Shipping to</h4>
                <p className="text-sm text-foreground">{openOrder.shippingAddress.fullName}</p>
                <p className="text-sm text-muted-foreground">{openOrder.shippingAddress.line1}</p>
                <p className="text-sm text-muted-foreground">
                  {openOrder.shippingAddress.city}, {openOrder.shippingAddress.state} - {openOrder.shippingAddress.pincode}
                </p>
                <p className="text-sm text-muted-foreground">📞 {openOrder.shippingAddress.phone}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel Modal — capture reason */}
      {confirmCancelId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setConfirmCancelId(null)}>
          <div className="bg-card rounded-xl shadow-modal w-full max-w-md p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold text-lg text-foreground mb-2">Cancel order?</h3>
            <p className="text-sm text-muted-foreground mb-3">Once cancelled, this order cannot be reactivated.</p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason (optional)"
              className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setConfirmCancelId(null)}
                className="flex-1 h-10 rounded-md border border-border text-foreground font-display font-bold text-sm hover:bg-muted"
              >
                Keep Order
              </button>
              <button
                onClick={submitCancel}
                className="flex-1 h-10 rounded-md bg-destructive text-destructive-foreground font-display font-bold text-sm hover:opacity-90"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default OrderHistory;
