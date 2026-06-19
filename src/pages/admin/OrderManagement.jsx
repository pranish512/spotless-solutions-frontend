import { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import { Eye, X, Search, PackageX, Ban } from "lucide-react";

// TODO: API INTEGRATION -> GET /api/admin/orders?status=&search= => { orders[] }
const initialOrders = [
  {
    id: "ORD-1001",
    customerName: "Anita Sharma",
    items: [
      { id: "p1", name: "Premium Multi-Surface Cleaner 500ml", quantity: 2, price: 249 },
      { id: "p2", name: "Heavy Duty Rubber Gloves", quantity: 1, price: 149 },
    ],
    total: 647,
    status: "Pending",
    shippingAddress: "12 MG Road, Bengaluru, KA 560001",
    cancellationReason: "",
  },
  {
    id: "ORD-1002",
    customerName: "Rohit Kumar",
    items: [{ id: "p4", name: "Complete Car Cleaning Kit", quantity: 1, price: 899 }],
    total: 899,
    status: "Delivered",
    shippingAddress: "44 Park Street, Kolkata, WB 700016",
    cancellationReason: "",
  },
  {
    id: "ORD-1003",
    customerName: "Meera P.",
    items: [{ id: "p5", name: "Microfiber Mop with Handle", quantity: 2, price: 599 }],
    total: 1198,
    status: "Cancelled",
    shippingAddress: "9 Anna Nagar, Chennai, TN 600040",
    cancellationReason: "Customer requested cancellation due to delayed dispatch.",
  },
];

const STATUS_FILTERS = ["All", "Pending", "Delivered", "Cancelled"];

const StatusPill = ({ status }) => {
  const map = {
    Pending: "bg-secondary/30 text-foreground",
    Delivered: "bg-accent/20 text-accent",
    Cancelled: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-md ${map[status] || "bg-muted"}`}>
      {status}
    </span>
  );
};

const OrderManagement = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [viewOrder, setViewOrder] = useState(null);
  const [cancelOrder, setCancelOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(null);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || o.status === filter;
    return matchSearch && matchFilter;
  });

  const submitCancel = (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    // TODO: API INTEGRATION -> POST /api/admin/orders/{id}/cancel { reason } => { order }
    setOrders((prev) =>
      prev.map((o) =>
        o.id === cancelOrder.id ? { ...o, status: "Cancelled", cancellationReason: cancelReason } : o
      )
    );
    setCancelOrder(null);
    setCancelReason("");
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-muted/30">
        <h2 className="font-display font-bold text-2xl text-foreground mb-6">Order Management</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID or customer..."
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring font-body"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-11 px-4 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring font-body"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState icon={PackageX} title="No orders yet" message="Orders will appear here once placed." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Order ID</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Items</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Customer</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Total</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Status</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{o.id}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {o.items.length} item{o.items.length > 1 ? "s" : ""}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{o.customerName}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        ₹{o.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* TODO: API INTEGRATION -> GET /api/admin/orders/{id} => { order } */}
                          <button
                            onClick={() => setViewOrder(o)}
                            className="p-2 rounded-md hover:bg-muted text-foreground transition-colors"
                            aria-label="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {o.status !== "Cancelled" && o.status !== "Delivered" && (
                            <button
                              onClick={() => setConfirmCancel(o)}
                              className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                              aria-label="Cancel order"
                            >
                              <Ban className="w-4 h-4" />
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

        {/* View Order Popup */}
        {viewOrder && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setViewOrder(null)}
          >
            <div
              className="bg-card rounded-xl shadow-modal w-full max-w-2xl p-6 my-8 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-xl text-foreground">
                  Order #{viewOrder.id}
                </h3>
                <button onClick={() => setViewOrder(null)} className="p-1 rounded-md hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="text-sm font-medium text-foreground">{viewOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <StatusPill status={viewOrder.status} />
                </div>
              </div>

              <h4 className="font-display font-semibold text-foreground mb-2">Items</h4>
              <div className="space-y-2 mb-4">
                {viewOrder.items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{it.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {it.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      ₹{(it.price * it.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Amount</span>
                  <span className="font-display font-bold text-lg text-foreground">
                    ₹{viewOrder.total.toLocaleString()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Shipping Address</p>
                  <p className="text-sm text-foreground">{viewOrder.shippingAddress}</p>
                </div>
                {viewOrder.cancellationReason && (
                  <div className="bg-destructive/10 rounded-md p-3">
                    <p className="text-xs font-semibold text-destructive">Cancellation Reason</p>
                    <p className="text-sm text-foreground">{viewOrder.cancellationReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confirm before opening cancel form */}
        <ConfirmDialog
          open={!!confirmCancel}
          title="Cancel this order?"
          message={`Order ${confirmCancel?.id} will be cancelled. You'll be asked to provide a reason.`}
          confirmLabel="Continue"
          confirmVariant="danger"
          onCancel={() => setConfirmCancel(null)}
          onConfirm={() => {
            setCancelOrder(confirmCancel);
            setConfirmCancel(null);
          }}
        />

        {/* Cancel reason popup */}
        {cancelOrder && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setCancelOrder(null)}
          >
            <div
              className="bg-card rounded-xl shadow-modal w-full max-w-lg p-6 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-xl text-foreground">
                  Cancel Order #{cancelOrder.id}
                </h3>
                <button onClick={() => setCancelOrder(null)} className="p-1 rounded-md hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={submitCancel}>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cancellation Reason *
                </label>
                <textarea
                  required
                  rows={5}
                  minLength={10}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a clear reason for cancelling this order..."
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body resize-none"
                />
                {cancelReason && cancelReason.trim().length < 10 && (
                  <p className="mt-1 text-xs text-destructive">
                    Reason must be at least 10 characters.
                  </p>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setCancelOrder(null)}
                    className="flex-1 h-11 rounded-lg border border-border text-foreground font-display font-bold text-sm hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-lg bg-destructive text-destructive-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderManagement;
