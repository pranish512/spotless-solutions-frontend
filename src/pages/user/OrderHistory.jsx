import Header from "@/components/Header";
import Footer from "@/components/Footer";

// TODO: API INTEGRATION -> GET /api/user/orders?page=1 => { orders: [{ id, date, total, status, items[] }], totalPages }

const OrderHistory = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h2 className="font-display font-bold text-2xl text-foreground mb-6">Order History</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Order ID</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Total</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-4 py-3 text-sm text-foreground">#ORD-1001</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">2026-03-01</td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">₹1,247</td>
                <td className="px-4 py-3"><span className="px-2 py-1 text-xs font-semibold rounded-md bg-accent text-accent-foreground">Delivered</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderHistory;
