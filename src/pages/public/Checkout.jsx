import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, CreditCard, CheckCircle2, Plus, FileText, Download, Eye, X } from "lucide-react";

// TODO: API INTEGRATION -> GET /api/user/addresses => { addresses: [{ id, label, fullName, line1, city, pin, phone }] }
const initialAddresses = [
  {
    id: "a1",
    label: "Home",
    fullName: "Anita Sharma",
    line1: "12 MG Road, Bengaluru",
    city: "Bengaluru",
    pin: "560001",
    phone: "+91 90000 11111",
  },
  {
    id: "a2",
    label: "Office",
    fullName: "Anita Sharma",
    line1: "Tech Park, Whitefield",
    city: "Bengaluru",
    pin: "560066",
    phone: "+91 90000 11111",
  },
];

// TODO: API INTEGRATION -> GET /api/cart => { items, subtotal, discount, gst, total }
const cartItems = [
  { id: "1", name: "Premium Multi-Surface Cleaner 500ml", price: 249, quantity: 2 },
  { id: "2", name: "Heavy Duty Rubber Gloves", price: 149, quantity: 1 },
];

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
  const [addresses] = useState(initialAddresses); // up to 4 from profile
  const [step, setStep] = useState(1);
  const [activeAddressIdx, setActiveAddressIdx] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [showInvoice, setShowInvoice] = useState(false);

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = Math.round(subtotal * 0.1);
  const gst = Math.round((subtotal - discount) * 0.18);
  const total = subtotal - discount + gst;

  const proceedToPayment = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const placeOrder = (e) => {
    e.preventDefault();
    // TODO: API INTEGRATION -> POST /api/orders { items, addressId, paymentMethod } => { orderId }
    // TODO: API INTEGRATION -> POST /api/payments/initiate { orderId, method } => { paymentUrl/status }
    navigate("/payment-success", {
      state: {
        orderId: "ORD-" + Math.floor(100000 + Math.random() * 900000),
        total,
        paymentMethod,
        expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
    });
  };

  const downloadInvoice = () => {
    // TODO: API INTEGRATION -> GET /api/orders/{id}/invoice.pdf (binary) => { downloadUrl }
    alert("Invoice PDF download will be triggered (API integration pending).");
  };

  const downloadQuote = () => {
    // TODO: API INTEGRATION -> GET /api/cart/quote.pdf (binary) => { downloadUrl }
    alert("Quote PDF download will be triggered (API integration pending).");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h2 className="font-display font-bold text-2xl text-foreground mb-6">Checkout</h2>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const reached = step >= s.id;
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      reached
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <p
                    className={`text-xs mt-1 font-display font-bold ${
                      reached ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step > s.id ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left – Step content */}
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <form onSubmit={proceedToPayment} className="bg-card rounded-xl shadow-card p-6">
                <h3 className="font-display font-bold text-lg text-foreground mb-4">
                  Select Delivery Address
                </h3>

                {/* Address tabs */}
                <div className="flex flex-wrap gap-2 mb-4 border-b border-border">
                  {addresses.slice(0, 4).map((addr, idx) => (
                    <button
                      type="button"
                      key={addr.id}
                      onClick={() => setActiveAddressIdx(idx)}
                      className={`px-4 py-2 text-sm font-display font-bold border-b-2 -mb-px transition-colors ${
                        idx === activeAddressIdx
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Address {idx + 1}
                    </button>
                  ))}
                </div>

                {/* Selected address details */}
                {addresses[activeAddressIdx] && (
                  <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 mb-4">
                    <p className="text-xs uppercase font-semibold text-primary mb-1">
                      {addresses[activeAddressIdx].label}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {addresses[activeAddressIdx].fullName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {addresses[activeAddressIdx].line1}, {addresses[activeAddressIdx].city} -{" "}
                      {addresses[activeAddressIdx].pin}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      📞 {addresses[activeAddressIdx].phone}
                    </p>
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
              </form>
            )}

            {step === 2 && (
              <form onSubmit={placeOrder} className="bg-card rounded-xl shadow-card p-6">
                <h3 className="font-display font-bold text-lg text-foreground mb-4">
                  Choose Payment Method
                </h3>
                <div className="space-y-3 mb-6">
                  {PAYMENT_METHODS.map((m) => {
                    const active = paymentMethod === m.id;
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                          active
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50"
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
                          <p className="text-sm font-display font-bold text-foreground">
                            {m.label}
                          </p>
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
                    className="flex-1 h-12 rounded-lg border border-border text-foreground font-display font-bold hover:bg-muted transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-12 rounded-lg bg-primary text-primary-foreground font-display font-bold hover:opacity-90 transition-opacity"
                  >
                    Place Order
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right – Pricing summary */}
          <aside className="bg-card rounded-xl shadow-card p-6 h-fit">
            <h3 className="font-display font-bold text-lg text-foreground mb-4">Order Summary</h3>

            <div className="space-y-2 mb-4 border-b border-border pb-4">
              {cartItems.map((it) => (
                <div key={it.id} className="flex justify-between text-sm">
                  <span className="text-foreground truncate pr-2">
                    {it.name} × {it.quantity}
                  </span>
                  <span className="text-foreground font-medium shrink-0">
                    ₹{(it.price * it.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-accent">− ₹{discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (18%)</span>
                <span className="text-foreground">+ ₹{gst.toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 mb-4">
              <div className="flex justify-between items-center bg-primary/10 rounded-lg p-3">
                <span className="font-display font-bold text-foreground">Final Total</span>
                <span className="font-display font-bold text-xl text-primary">
                  ₹{total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Invoice / Quote actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowInvoice(true)}
                className="inline-flex items-center justify-center gap-1 px-3 h-10 rounded-lg border border-border text-foreground text-xs font-display font-bold hover:bg-muted transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> View Invoice
              </button>
              <button
                onClick={downloadInvoice}
                className="inline-flex items-center justify-center gap-1 px-3 h-10 rounded-lg border border-border text-foreground text-xs font-display font-bold hover:bg-muted transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Invoice PDF
              </button>
              <button
                onClick={downloadQuote}
                className="col-span-2 inline-flex items-center justify-center gap-1 px-3 h-10 rounded-lg border border-border text-foreground text-xs font-display font-bold hover:bg-muted transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> Download Quote (PDF)
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Invoice Preview */}
      {showInvoice && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowInvoice(false)}
        >
          <div
            className="bg-card rounded-xl shadow-modal w-full max-w-lg p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-xl text-foreground">Invoice Preview</h3>
              <button onClick={() => setShowInvoice(false)} className="p-1 rounded-md hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              {cartItems.map((it) => (
                <div key={it.id} className="flex justify-between">
                  <span>
                    {it.name} × {it.quantity}
                  </span>
                  <span>₹{(it.price * it.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-accent">− ₹{discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST</span>
                <span>+ ₹{gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-display font-bold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">₹{total.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={downloadInvoice}
              className="mt-5 w-full h-11 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Download PDF
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Checkout;
