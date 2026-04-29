import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PaymentSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!state) {
      navigate("/", { replace: true });
      return;
    }
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, [state, navigate]);

  if (!state) return null;

  const coins = [0, 1, 2, 3, 4];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-card rounded-2xl shadow-modal p-10 max-w-md w-full text-center animate-fade-in">
          {/* Tick + coins animation */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            {/* Coins popping behind */}
            {coins.map((i) => {
              const angle = (i / coins.length) * 2 * Math.PI - Math.PI / 2;
              const radius = 56;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              return (
                <span
                  key={i}
                  className="absolute top-1/2 left-1/2 w-6 h-6 rounded-full bg-secondary border-2 border-secondary-foreground/30 shadow-md flex items-center justify-center text-[10px] font-bold text-secondary-foreground"
                  style={{
                    transform: show
                      ? `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`
                      : "translate(-50%, -50%) scale(0)",
                    transition: `transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 80}ms, opacity 400ms ${i * 80}ms`,
                    opacity: show ? 1 : 0,
                  }}
                >
                  ₹
                </span>
              );
            })}

            {/* Tick circle */}
            <div
              className="relative z-10 w-32 h-32 rounded-full bg-accent flex items-center justify-center mx-auto"
              style={{
                transform: show ? "scale(1)" : "scale(0.4)",
                opacity: show ? 1 : 0,
                transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms",
              }}
            >
              <Check
                className="w-16 h-16 text-accent-foreground"
                strokeWidth={3}
                style={{
                  transform: show ? "scale(1)" : "scale(0)",
                  transition: "transform 400ms ease-out 300ms",
                }}
              />
            </div>
          </div>

          <h2 className="font-display font-bold text-2xl text-foreground mb-2">
            Payment Successful!
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Thank you for shopping with Spotless Solutions.
          </p>

          <div className="bg-muted/40 rounded-lg p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Order ID</span>
              <span className="text-sm font-display font-bold text-foreground">
                {state.orderId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Amount Paid</span>
              <span className="text-sm font-display font-bold text-primary">
                ₹{state.total?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Payment Method</span>
              <span className="text-sm font-medium text-foreground uppercase">
                {state.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Expected Delivery</span>
              <span className="text-sm font-medium text-foreground">
                {state.expectedDelivery}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to="/user/orders"
              className="flex-1 h-11 rounded-lg border border-border text-foreground font-display font-bold text-sm hover:bg-muted transition-colors flex items-center justify-center"
            >
              View Orders
            </Link>
            <Link
              to="/shop"
              className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
