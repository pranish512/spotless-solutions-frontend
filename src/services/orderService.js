import { apiRequest, buildQuery, resolveImageUrl } from "./api";

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
        phone: a.phone || "",
      }
    : null;

const mapOrderItem = (item) => ({
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

const mapStatusHistory = (h) => ({
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
  items: (o.items || []).map(mapOrderItem),
  statusHistory: (o.status_history || []).map(mapStatusHistory),
  payment: mapPayment(o.payment),
});

const unwrap = (response) => response?.data || response || {};

export const orderService = {
  async placeOrder({ shippingAddressId, billingAddressId, paymentMethod, notes }) {
    const response = await apiRequest("/user/orders", {
      method: "POST",
      body: {
        shipping_address_id: shippingAddressId,
        billing_address_id: billingAddressId || null,
        payment_method: paymentMethod,
        notes: notes || null,
      },
    });
    return mapOrder(unwrap(response));
  },

  async listMyOrders({ page = 1, limit = 10, status = "" } = {}) {
    const response = await apiRequest(
      `/user/orders${buildQuery({ page, limit, status })}`
    );
    const items = (response?.items || []).map(mapOrder);
    return {
      total: response?.total || items.length,
      page: response?.page || page,
      limit: response?.limit || limit,
      items,
    };
  },

  async getMyOrder(orderId) {
    const response = await apiRequest(`/user/orders/${orderId}`);
    return mapOrder(unwrap(response));
  },

  async cancelMyOrder(orderId, reason) {
    const response = await apiRequest(`/user/orders/${orderId}/cancel`, {
      method: "POST",
      body: { reason },
    });
    return mapOrder(unwrap(response));
  },

  invoiceUrl(orderId) {
    const base = import.meta.env.VITE_API_BASE_URL || "/api";
    return `${base}/user/orders/${orderId}/invoice`;
  },
};
