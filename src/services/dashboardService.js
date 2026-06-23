// Admin dashboard — single aggregation call. The server does the heavy SQL;
// the client shapes/derives (pie %, formatting, count-up animation).
import { apiRequest } from "./api";

const unwrap = (r) => r?.data || r || {};

export const dashboardService = {
  async getDashboard() {
    const data = unwrap(await apiRequest("/admin/dashboard"));
    const t = data.totals || {};
    return {
      totals: {
        products: t.products ?? 0,
        users: t.users ?? 0,
        orders: t.orders ?? 0,
        revenue: t.revenue ?? 0,
        orderedAmount: t.ordered_amount ?? 0,
      },
      monthlyOrders: (data.monthly_orders || []).map((m) => ({
        month: m.label || m.month,
        orders: m.orders ?? 0,
      })),
      salesByCategory: (data.sales_by_category || []).map((c) => ({
        name: c.name,
        value: c.value ?? 0,
      })),
    };
  },
};
