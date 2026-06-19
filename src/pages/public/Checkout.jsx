import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, CreditCard, CheckCircle2, Plus, FileText, Eye, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/store/CartContext";
import { addressService } from "@/services/addressService";
import { orderService } from "@/services/orderService";

const STEPS = [
  { id: 1, label: "Address", icon: MapPin },
  { id: 2, label: "Payment", icon: CreditCard },
  { id: 3, label: "Confirmation", icon: CheckCircle2 },
];

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", description: "Google Pay, PhonePe, Paytm, etc." },
  { id: "card", label: "Credit / Debit Card", description: "Visa, MasterCard, Rupay" },
  { id: "cod", label: "Cash on Delivery", description: "Pay with cash on delivery" },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items: cartItems, total: cartSubtotal, refresh: refreshCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [activeAddressIdx, setActiveAddressIdx] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [showInvoice, setShowInvoice] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  // Customers must be logged in to checkout — guest cart placed orders need a user_id.
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    (async () => {
      setAddressesLoading(true);
      try {
        const data = await addressService.listAddresses({ limit: 50 });
        if (!active) return;
        setAddresses(data.items);
        const defaultIdx = data.items.findIndex((a) => a.isDefault);
        setActiveAddressIdx(defaultIdx >= 0 ? defaultIdx : 0);
      } catch (err) {
        if (active) setError(err?.message || "Unable to load addresses");
      } finally {
        if (active) setAddressesLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  // Totals — match backend formula: subtotal + 18% GST, no discount/shipping for now.
  const subtotal = cartSubtotal;
  const discount = 0;
  const gst = Math.round((subtotal - discount) * 0.18);
  const total = subtotal - discount + gst;

  const proceedToPayment = (e) => {
    e.preventDefault();
    setError("");
    if (!addresses[activeAddressIdx]) {
      setError("Please add a delivery address before continuing.");
      return;
    }
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setStep(2);
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setError("");
    if (placing) return;
    setPlacing(true);
    try {
      const order = await orderService.placeOrder({
        shippingAddressId: addresses[activeAddressIdx].id,
        paymentMethod,
      });
      await refreshCart();
      navigate("/payment-success", {
        replace: true,
        state: {
          orderId: order.orderNumber,
          orderUuid: order.id,
          total: order.grandTotal,
          paymentMethod,
          expectedDelivery: order.expectedDeliveryAt,
        },
      });
    } catch (err) {
      setError(err?.message || "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h2 className="font-display font-bold text-2xl text-foreground mb-6">Checkout</h2>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto gap-1 sm:gap-0">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const reached = step >= s.id;
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none min-w-0">
                <div className="flex flex-col items-center min-w-0">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                      reached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <p
                    className={`text-[10px] sm:text-xs mt-1 font-display font-bold truncate ${
                      reached ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 sm:mx-2 ${step > s.id ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left – Step content */}
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <form onSubmit={proceedToPayment} className="bg-card rounded-xl shadow-card p-6">
                <h3 className="font-display font-bold text-lg text-foreground mb-4">Select Delivery Address</h3>

                {addressesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading addresses…</p>
                ) : addresses.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center mb-4">
                    <p className="text-sm text-foreground mb-2">No delivery address found.</p>
                    <button
                      type="button"
                      onClick={() => navigate("/user/profile")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-display font-bold hover:opacity-90"
                    >
                      <Plus className="w-4 h-4" /> Add address in profile
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 mb-4 border-b border-border">
                      {addresses.slice(0, 4).map((addr, idx) => (
                        <button
                          type="button"
                          key={addr.id}
                          onClick={() => setActiveAddressIdx(idx)}
                          className={`px-4 py-2 text-sm font-display font-bold border-b-2 -mb-px transition-colors ${
                            idx === activeAddressIdx ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {addr.label || `Address ${idx + 1}`}
                        </button>
                      ))}
                    </div>

                    {addresses[activeAddressIdx] && (
                      <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 mb-4">
                        <p className="text-xs uppercase font-semibold text-primary mb-1">{addresses[activeAddressIdx].label}</p>
                        <p className="text-sm font-medium text-foreground">{addresses[activeAddressIdx].fullName || "—"}</p>
                        <p className="text-sm text-muted-foreground">
                          {addresses[activeAddressIdx].line1}
                          {addresses[activeAddressIdx].line2 ? `, ${addresses[activeAddressIdx].line2}` : ""}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {addresses[activeAddressIdx].city}, {addresses[activeAddressIdx].state} - {addresses[activeAddressIdx].pincode}
                        </p>
                        <p className="text-sm text-muted-foreground">📞 {addresses[activeAddressIdx].phone}</p>
                      </div>
                    )}

                    {addresses.length < 4 && (
                      <button
                        type="button"
                        onClick={() => navigate("/user/profile")}
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline mb-4"
                      >
                        <Plus className="w-4 h-4" /> Add new address (in profile)
                      </button>
                    )}

                    <button
                      type="submit"
                      className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-display font-bold hover:opacity-90 transition-opacity"
                    >
                      Proceed to Payment
                    </button>
                  </>
                )}
              </form>
            )}

            {step === 2 && (
              <form onSubmit={placeOrder} className="bg-card rounded-xl shadow-card p-6">
                <h3 className="font-display font-bold text-lg text-foreground mb-4">Choose Payment Method</h3>
                <div className="space-y-3 mb-6">
                  {PAYMENT_METHODS.map((m) => {
                    const active = paymentMethod === m.id;
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                          active ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={m.id}
                          checked={active}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 text-primary"
                        />
                        <div>
                          <p className="text-sm font-display font-bold text-foreground">{m.label}</p>
                          <p className="text-xs text-muted-foreground">{m.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={placing}
                    className="flex-1 h-12 rounded-lg border border-border text-foreground font-display font-bold hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={placing}
                    className="flex-1 h-12 rounded-lg bg-primary text-primary-foreground font-display font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {placing ? "Placing Order…" : "Place Order"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right – Pricing summary */}
          <aside className="bg-card rounded-xl shadow-card p-6 h-fit lg:sticky lg:top-6">
            <h3 className="font-display font-bold text-lg text-foreground mb-4">Order Summary</h3>

            <div className="space-y-2 mb-4 border-b border-border pb-4">
              {cartItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">Your cart is empty.</p>
              ) : (
                cartItems.map((it) => (
                  <div key={it.id} className="flex justify-between items-baseline gap-2 text-sm">
                    <span className="text-foreground flex-1 min-w-0 truncate">
                      {it.name} × {it.quantity}
                    </span>
                    <span className="text-foreground font-medium shrink-0">
                      ₹{(it.price * it.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-accent">− ₹{discount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (18%)</span>
                <span className="text-foreground">+ ₹{gst.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 mb-4">
              <div className="flex justify-between items-center bg-primary/10 rounded-lg p-3">
                <span className="font-display font-bold text-foreground">Final Total</span>
                <span className="font-display font-bold text-xl text-primary">₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInvoice(true)}
              className="w-full inline-flex items-center justify-center gap-1 px-3 h-10 rounded-lg border border-border text-foreground text-xs font-display font-bold hover:bg-muted transition-colors"
            >
              <Eye className="w-3.5 h-3.5" /> Preview Order Summary
            </button>
            <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
              <FileText className="w-3 h-3 inline mr-1" />
              Tax invoice will be available after the order is placed.
            </p>
          </aside>
        </div>
      </div>

      {/* Order Preview */}
      {showInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowInvoice(false)}>
          <div className="bg-card rounded-xl shadow-modal w-full max-w-lg p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-xl text-foreground">Order Preview</h3>
              <button onClick={() => setShowInvoice(false)} className="p-1 rounded-md hover:bg-muted" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              {cartItems.map((it) => (
                <div key={it.id} className="flex justify-between">
                  <span>{it.name} × {it.quantity}</span>
                  <span>₹{(it.price * it.quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST</span>
                <span>+ ₹{gst.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-display font-bold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Checkout;
