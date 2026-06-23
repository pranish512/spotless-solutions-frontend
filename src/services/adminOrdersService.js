// Admin Orders API client — wraps /api/admin/orders (requires the `orders` screen
// permission; admin role bypasses). Mirrors the customer orderService order shape
// so the admin UI works in the same camelCase fields used elsewhere.
import { apiRequest, buildQuery } from "./api";

const mapAddress = (a) =>
  a
    ? {
        id: a.id,
        label: a.label || "",
        fullName: a.full_name || "",
        line1: a.line1 || "",
        line2: a.line2 || "",
        city: a.city || "",
        state: a.state || "",
        pincode: a.pincode || "",
        country: a.country || "",
        phone: a.phone || "",
      }
    : null;

const mapItem = (item) => ({
  id: item.id,
  productId: item.product_id || null,
  variantId: item.variant_id || null,
  productName: item.product_name || "",
  sku: item.sku || null,
  quantity: item.quantity ?? 0,
  unitPrice: item.unit_price ?? 0,
  discount: item.discount ?? 0,
  tax: item.tax ?? 0,
  lineTotal: item.line_total ?? 0,
});

const mapHistory = (h) => ({
  id: h.id,
  fromStatus: h.from_status,
  toStatus: h.to_status,
  changedBy: h.changed_by,
  note: h.note,
  createdAt: h.created_at,
});

const mapPayment = (p) =>
  p
    ? {
        id: p.id,
        provider: p.provider,
        providerPaymentId: p.provider_payment_id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        paidAt: p.paid_at,
      }
    : null;

const mapOrder = (o) => ({
  id: o.id,
  orderNumber: o.order_number,
  userId: o.user_id,
  customerName: o.customer_name || "",
  status: o.status,
  subtotal: o.subtotal ?? 0,
  discountTotal: o.discount_total ?? 0,
  taxTotal: o.tax_total ?? 0,
  shippingTotal: o.shipping_total ?? 0,
  grandTotal: o.grand_total ?? 0,
  currency: o.currency || "INR",
  placedAt: o.placed_at,
  dispatchedAt: o.dispatched_at,
  deliveredAt: o.delivered_at,
  cancelledAt: o.cancelled_at,
  expectedDeliveryAt: o.expected_delivery_at,
  notes: o.notes,
  shippingAddress: mapAddress(o.shipping_address),
  billingAddress: mapAddress(o.billing_address),
  items: (o.items || []).map(mapItem),
  statusHistory: (o.status_history || []).map(mapHistory),
  payment: mapPayment(o.payment),
});

const unwrap = (response) => response?.data || response || {};

export const adminOrdersService = {
  // List endpoint returns the list envelope { total, page, limit, items } and the
  // items are already fully serialized (items/history/payment/addresses included).
  async listOrders({ page = 1, limit = 100, status = "", search = "" } = {}) {
    const response = await apiRequest(`/admin/orders${buildQuery({ page, limit, status, search })}`);
    const items = (response?.items || []).map(mapOrder);
    return {
      total: response?.total ?? items.length,
      page: response?.page ?? page,
      limit: response?.limit ?? limit,
      items,
    };
  },

  async getOrder(orderId) {
    const response = await apiRequest(`/admin/orders/${orderId}`);
    return mapOrder(unwrap(response));
  },

  // Generic state-machine transition (backend rejects invalid transitions with 400).
  async updateStatus(orderId, status, note) {
    const response = await apiRequest(`/admin/orders/${orderId}/status`, {
      method: "PATCH",
      body: { status, note: note || null },
    });
    return mapOrder(unwrap(response));
  },

  async acceptOrder(orderId) {
    const response = await apiRequest(`/admin/orders/${orderId}/accept`, { method: "POST" });
    return mapOrder(unwrap(response));
  },

  // reject/cancel require a reason (backend enforces min 5 chars).
  async rejectOrder(orderId, reason) {
    const response = await apiRequest(`/admin/orders/${orderId}/reject`, {
      method: "POST",
      body: { reason },
    });
    return mapOrder(unwrap(response));
  },

  async cancelOrder(orderId, reason) {
    const response = await apiRequest(`/admin/orders/${orderId}/cancel`, {
      method: "POST",
      body: { reason },
    });
    return mapOrder(unwrap(response));
  },

  async deleteOrder(orderId) {
    await apiRequest(`/admin/orders/${orderId}`, { method: "DELETE" });
    return true;
  },
};
