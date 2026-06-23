import { useCallback, useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import { Eye, X, Search, PackageX, Ban, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { adminOrdersService } from "@/services/adminOrdersService";

// Status presentation — kept in sync with the customer OrderHistory page so the
// admin view speaks the same visual language.
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

const ALL_STATUSES = [
  "pending", "confirmed", "accepted", "processing", "dispatched",
  "out_for_delivery", "delivered", "cancelled", "rejected", "refunded",
];

// Mirror of the backend state machine (order_service.ALLOWED_TRANSITIONS). Used
// only to render valid action buttons; the backend remains the source of truth.
const NEXT_STATES = {
  pending: ["confirmed", "cancelled", "rejected"],
  confirmed: ["accepted", "cancelled", "rejected"],
  accepted: ["processing", "cancelled"],
  processing: ["dispatched", "cancelled"],
  dispatched: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],
  rejected: [],
  refunded: [],
};

// Transitions that require a reason (routed through the dedicated cancel/reject endpoints).
const REASON_REQUIRED = new Set(["cancelled", "rejected"]);

const STATUS_FILTERS = ["all", ...ALL_STATUSES];
const PAGE_SIZE = 20;

const StatusPill = ({ status }) => (
  <span className={`px-2 py-1 text-xs font-semibold rounded-md ${STATUS_STYLE[status] || "bg-muted text-foreground"}`}>
    {STATUS_LABEL[status] || status}
  </span>
);

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
};

const OrderManagement = () => {
  const { can } = useAuth();
  const canWrite = can("orders", "write");
  const canDelete = can("orders", "delete");

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [viewOrder, setViewOrder] = useState(null);
  const [reasonAction, setReasonAction] = useState(null); // { order, target }
  const [reasonText, setReasonText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [busy, setBusy] = useState(false);

  // Debounce the search box before querying the server.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Server-side paginated load (20/page); status + search are server filters.
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminOrdersService.listOrders({
        page,
        limit: PAGE_SIZE,
        status: filter === "all" ? "" : filter,
        search: debouncedSearch,
      });
      setOrders(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err?.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, [page, filter, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Replace an order in the list (and in the open detail modal) after a mutation.
  const applyUpdate = (updated) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setViewOrder((prev) => (prev && prev.id === updated.id ? updated : prev));
  };

  const openReason = (order, target) => {
    setReasonText("");
    setReasonAction({ order, target });
  };

  const runTransition = async (order, target) => {
    setBusy(true);
    setError("");
    try {
      let updated;
      if (target === "cancelled") {
        updated = await adminOrdersService.cancelOrder(order.id, reasonText.trim());
      } else if (target === "rejected") {
        updated = await adminOrdersService.rejectOrder(order.id, reasonText.trim());
      } else {
        updated = await adminOrdersService.updateStatus(order.id, target);
      }
      applyUpdate(updated);
      setReasonAction(null);
      setReasonText("");
    } catch (err) {
      setError(err?.message || "Could not update order status.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    setError("");
    try {
      await adminOrdersService.deleteOrder(confirmDeleteId);
      setViewOrder((prev) => (prev && prev.id === confirmDeleteId ? null : prev));
      setConfirmDeleteId(null);
      await load();
    } catch (err) {
      setError(err?.message || "Could not delete order.");
    } finally {
      setBusy(false);
    }
  };

  const lastNote = (order) =>
    order.statusHistory?.length ? order.statusHistory[order.statusHistory.length - 1]?.note : "";

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/30 min-w-0">
        <h2 className="font-display font-bold text-2xl text-foreground mb-6">Order Management</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search order number or customer..."
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring font-body"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            className="h-11 px-4 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring font-body"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Statuses" : STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}

        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          {loading ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">Loading orders…</p>
          ) : orders.length === 0 ? (
            <EmptyState icon={PackageX} title="No orders found" message="Orders will appear here once placed." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Order</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Items</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Customer</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Total</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Status</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">#{o.orderNumber}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{o.customerName || "—"}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        ₹{o.grandTotal.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewOrder(o)}
                            className="p-2 rounded-md hover:bg-muted text-foreground transition-colors"
                            aria-label="View order"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canWrite && NEXT_STATES[o.status]?.includes("cancelled") && (
                            <button
                              onClick={() => openReason(o, "cancelled")}
                              className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                              aria-label="Cancel order"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setConfirmDeleteId(o.id)}
                              className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                              aria-label="Delete order"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination — 20 per page, server-side */}
        {!loading && total > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
            <span className="text-xs text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString("en-IN")} orders
            </span>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-1 px-3 h-9 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="text-xs text-muted-foreground px-1">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-1 px-3 h-9 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* View Order Popup */}
        {viewOrder && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto"
            onClick={() => setViewOrder(null)}
          >
            <div
              className="bg-card rounded-xl shadow-modal w-full max-w-2xl p-4 sm:p-6 my-8 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display font-bold text-xl text-foreground">Order #{viewOrder.orderNumber}</h3>
                <button onClick={() => setViewOrder(null)} className="p-1 rounded-md hover:bg-muted" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Placed on {fmtDate(viewOrder.placedAt)}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="text-sm font-medium text-foreground">{viewOrder.customerName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <StatusPill status={viewOrder.status} />
                </div>
              </div>

              {/* Status transition actions */}
              {canWrite && NEXT_STATES[viewOrder.status]?.length > 0 && (
                <div className="mb-4 border border-border rounded-lg p-3 bg-muted/30">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Update status</p>
                  <div className="flex flex-wrap gap-2">
                    {NEXT_STATES[viewOrder.status].map((target) => {
                      const danger = REASON_REQUIRED.has(target);
                      return (
                        <button
                          key={target}
                          disabled={busy}
                          onClick={() =>
                            danger ? openReason(viewOrder, target) : runTransition(viewOrder, target)
                          }
                          className={`px-3 h-9 rounded-md text-xs font-display font-bold transition-colors disabled:opacity-50 ${
                            danger
                              ? "border border-destructive/40 text-destructive hover:bg-destructive/10"
                              : "bg-primary text-primary-foreground hover:opacity-90"
                          }`}
                        >
                          {STATUS_LABEL[target]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <h4 className="font-display font-semibold text-foreground mb-2">Items</h4>
              <div className="space-y-2 mb-4">
                {viewOrder.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{it.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty {it.quantity} · ₹{it.unitPrice.toLocaleString("en-IN")} each
                      </p>
                    </div>
                    <p className="text-sm font-bold text-foreground shrink-0">
                      ₹{it.lineTotal.toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">₹{viewOrder.subtotal.toLocaleString("en-IN")}</span>
                </div>
                {viewOrder.discountTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-accent">− ₹{viewOrder.discountTotal.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST</span>
                  <span className="text-foreground">₹{viewOrder.taxTotal.toLocaleString("en-IN")}</span>
                </div>
                {viewOrder.shippingTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">₹{viewOrder.shippingTotal.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between font-display font-bold text-lg pt-1">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">₹{viewOrder.grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {viewOrder.payment && (
                <div className="mt-4 border-t border-border pt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="text-foreground">
                    {(viewOrder.payment.provider || "—").toUpperCase()} ·{" "}
                    <span className="font-medium">{(viewOrder.payment.status || "pending").toUpperCase()}</span>
                  </span>
                </div>
              )}

              {viewOrder.shippingAddress && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground mb-1">Shipping Address</p>
                  <p className="text-sm font-medium text-foreground">{viewOrder.shippingAddress.fullName || "—"}</p>
                  <p className="text-sm text-muted-foreground">
                    {viewOrder.shippingAddress.line1}
                    {viewOrder.shippingAddress.line2 ? `, ${viewOrder.shippingAddress.line2}` : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {viewOrder.shippingAddress.city}, {viewOrder.shippingAddress.state} - {viewOrder.shippingAddress.pincode}
                  </p>
                  {viewOrder.shippingAddress.phone && (
                    <p className="text-sm text-muted-foreground">📞 {viewOrder.shippingAddress.phone}</p>
                  )}
                </div>
              )}

              {viewOrder.statusHistory?.length > 0 && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">History</p>
                  <ol className="space-y-2">
                    {viewOrder.statusHistory.map((h) => (
                      <li key={h.id} className="flex items-start gap-3 text-sm">
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-foreground">
                            {h.fromStatus ? `${STATUS_LABEL[h.fromStatus] || h.fromStatus} → ` : ""}
                            <span className="font-medium">{STATUS_LABEL[h.toStatus] || h.toStatus}</span>
                          </p>
                          {h.note && <p className="text-xs text-muted-foreground">{h.note}</p>}
                          <p className="text-[11px] text-muted-foreground">{fmtDate(h.createdAt)}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reason capture for cancel / reject */}
        {reasonAction && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setReasonAction(null)}
          >
            <div
              className="bg-card rounded-xl shadow-modal w-full max-w-lg p-6 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-xl text-foreground">
                  {reasonAction.target === "rejected" ? "Reject" : "Cancel"} Order #{reasonAction.order.orderNumber}
                </h3>
                <button onClick={() => setReasonAction(null)} className="p-1 rounded-md hover:bg-muted" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (reasonText.trim().length < 5) return;
                  runTransition(reasonAction.order, reasonAction.target);
                }}
              >
                <label className="block text-sm font-medium text-foreground mb-2">Reason *</label>
                <textarea
                  required
                  rows={5}
                  minLength={5}
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  placeholder="Please provide a clear reason..."
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body resize-none"
                />
                {reasonText && reasonText.trim().length < 5 && (
                  <p className="mt-1 text-xs text-destructive">Reason must be at least 5 characters.</p>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setReasonAction(null)}
                    className="flex-1 h-11 rounded-lg border border-border text-foreground font-display font-bold text-sm hover:bg-muted transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={busy || reasonText.trim().length < 5}
                    className="flex-1 h-11 rounded-lg bg-destructive text-destructive-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {busy ? "Submitting…" : reasonAction.target === "rejected" ? "Reject Order" : "Cancel Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete confirmation — hard delete, cascades on the backend */}
        <ConfirmDialog
          open={!!confirmDeleteId}
          title="Delete this order?"
          message="This permanently removes the order and its items, history, and shipments. This cannot be undone."
          confirmLabel="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      </main>
    </div>
  );
};

export default OrderManagement;
