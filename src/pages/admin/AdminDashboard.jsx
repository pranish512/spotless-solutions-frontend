import { useEffect, useMemo, useRef, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Package, Users, ShoppingCart, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { dashboardService } from "@/services/dashboardService";
import { adminOrdersService } from "@/services/adminOrdersService";

const PIE_COLORS = [
  "hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))",
  "hsl(var(--destructive))", "hsl(var(--muted-foreground))", "hsl(197 60% 60%)",
];

const fmtNum = (n) => Number(n || 0).toLocaleString("en-IN");
const fmtINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const RECENT_PAGE_SIZE = 5;

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
const labelize = (s) => (s || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// Animated count-up — the "number loading" feel. Eases from its last value → target.
const useCountUp = (target, duration = 850) => {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
};

const CountUp = ({ value, format = fmtNum, className }) => {
  const display = useCountUp(value || 0);
  return <span className={className}>{format(display)}</span>;
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [recent, setRecent] = useState([]);
  const [recentPage, setRecentPage] = useState(1);
  const [recentTotal, setRecentTotal] = useState(0);
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    let active = true;
    dashboardService
      .getDashboard()
      .then((d) => { if (active) setData(d); })
      .catch((err) => { if (active) setError(err?.message || "Unable to load dashboard."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setRecentLoading(true);
    adminOrdersService
      .listOrders({ page: recentPage, limit: RECENT_PAGE_SIZE })
      .then((res) => { if (active) { setRecent(res.items); setRecentTotal(res.total); } })
      .catch(() => { if (active) { setRecent([]); setRecentTotal(0); } })
      .finally(() => { if (active) setRecentLoading(false); });
    return () => { active = false; };
  }, [recentPage]);

  const totals = data?.totals || { products: 0, users: 0, orders: 0, revenue: 0, orderedAmount: 0 };
  const monthly = data?.monthlyOrders || [];
  const categorySales = data?.salesByCategory || [];

  // Client-side pie shaping: total + per-slice share %.
  const categoryTotal = useMemo(() => categorySales.reduce((s, c) => s + c.value, 0), [categorySales]);
  const recentPages = Math.max(1, Math.ceil(recentTotal / RECENT_PAGE_SIZE));

  const stats = [
    { label: "Total Products", value: totals.products, icon: Package, color: "bg-primary/10 text-primary" },
    { label: "Total Users", value: totals.users, icon: Users, color: "bg-accent/10 text-accent" },
    { label: "Total Orders", value: totals.orders, icon: ShoppingCart, color: "bg-secondary/10 text-secondary-foreground" },
  ];

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/30 min-w-0">
        <h2 className="font-display font-bold text-2xl text-foreground mb-6 sm:mb-8">Dashboard</h2>

        {error && <div className="mb-6 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-lg p-6 shadow-card">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-display font-bold text-foreground">
                {loading ? <span className="text-muted-foreground/40">—</span> : <CountUp value={stat.value} />}
              </p>
            </div>
          ))}

          {/* Revenue card — earned (profitable) on top, gross ordered below */}
          <div className="bg-card rounded-lg p-6 shadow-card">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-sm text-muted-foreground">Revenue <span className="text-[10px] text-muted-foreground/70">(earned)</span></p>
            <p className="text-2xl font-display font-bold text-foreground">
              {loading ? <span className="text-muted-foreground/40">—</span> : <CountUp value={totals.revenue} format={fmtINR} />}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total ordered: {loading ? "—" : <CountUp value={totals.orderedAmount} format={fmtINR} className="font-medium" />}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6 shadow-card lg:col-span-2 min-w-0">
            <h3 className="font-display font-semibold text-foreground mb-4">Monthly Orders</h3>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-card min-w-0">
            <h3 className="font-display font-semibold text-foreground mb-4">Sales by Category</h3>
            {categorySales.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">No sales yet.</p>
            ) : (
              <>
                <div className="w-full h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        formatter={(v) => fmtINR(v)}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      />
                      <Pie data={categorySales} dataKey="value" nameKey="name" outerRadius={80} innerRadius={42}>
                        {categorySales.map((_, idx) => (
                          <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Client-derived legend with share % */}
                <ul className="mt-3 space-y-1.5">
                  {categorySales.map((c, idx) => (
                    <li key={c.name} className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                        <span className="truncate text-foreground">{c.name}</span>
                      </span>
                      <span className="text-muted-foreground shrink-0">
                        {fmtINR(c.value)} · {categoryTotal ? Math.round((c.value / categoryTotal) * 100) : 0}%
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Recent orders — 5 per page, paginated via the existing orders API */}
        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="font-display font-semibold text-foreground">Recent Orders</h3>
            <span className="text-xs text-muted-foreground">{fmtNum(recentTotal)} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-foreground">Order</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Customer</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Total</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Placed</th>
                </tr>
              </thead>
              <tbody>
                {recentLoading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">Loading…</td></tr>
                ) : recent.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">No orders yet.</td></tr>
                ) : recent.map((o) => (
                  <tr key={o.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-6 py-3 text-sm font-medium text-foreground">#{o.orderNumber}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{o.customerName || "—"}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{fmtINR(o.grandTotal)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-md ${STATUS_STYLE[o.status] || "bg-muted text-foreground"}`}>
                        {labelize(o.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{fmtDate(o.placedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-border">
            <span className="text-xs text-muted-foreground">Page {recentPage} of {recentPages}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRecentPage((p) => Math.max(1, p - 1))}
                disabled={recentPage <= 1 || recentLoading}
                className="inline-flex items-center gap-1 px-3 h-9 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button
                onClick={() => setRecentPage((p) => Math.min(recentPages, p + 1))}
                disabled={recentPage >= recentPages || recentLoading}
                className="inline-flex items-center gap-1 px-3 h-9 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
