import AdminSidebar from "@/components/AdminSidebar";
import { Package, Users, ShoppingCart, TrendingUp } from "lucide-react";

// TODO: API INTEGRATION -> GET /api/admin/dashboard/stats => { totalProducts, totalUsers, totalOrders, revenue }

const stats = [
  { label: "Total Products", value: "1,234", icon: Package, color: "bg-primary/10 text-primary" },
  { label: "Total Users", value: "5,678", icon: Users, color: "bg-accent/10 text-accent" },
  { label: "Total Orders", value: "890", icon: ShoppingCart, color: "bg-secondary/10 text-secondary-foreground" },
  { label: "Revenue", value: "₹12,45,000", icon: TrendingUp, color: "bg-destructive/10 text-destructive" },
];

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-muted/30">
        <h2 className="font-display font-bold text-2xl text-foreground mb-8">Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-lg p-6 shadow-card">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="bg-card rounded-lg p-6 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-4">Recent Orders</h3>
          <p className="text-sm text-muted-foreground">Order data will appear here once the API is connected.</p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
