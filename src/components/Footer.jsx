import { Link } from "react-router-dom";
import { ShieldCheck, Truck, RotateCcw, Headphones, Mail, Phone, Clock } from "lucide-react";

const trustBadges = [
  { icon: Truck, title: "Fast Delivery", desc: "On all orders" },
  { icon: ShieldCheck, title: "Secure Payment", desc: "256-bit SSL" },
  { icon: RotateCcw, title: "Easy Returns", desc: "Hassle free" },
  { icon: Headphones, title: "24/7 Support", desc: "We're here to help" },
];

const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border mt-16">
      {/* Trust strip */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {trustBadges.map((b) => (
            <div key={b.title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <b.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-display font-semibold text-sm text-foreground truncate">{b.title}</p>
                <p className="text-xs text-muted-foreground truncate">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="font-display font-bold text-lg text-foreground mb-4">Spotless Solutions</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your one-stop shop for premium cleaning supplies. From household essentials to professional-grade products.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop" className="hover:text-primary transition-colors">All Products</Link></li>
            <li><Link to="/shop?filter=new" className="hover:text-primary transition-colors">New Arrivals</Link></li>
            <li><Link to="/shop?filter=sale" className="hover:text-primary transition-colors">On Sale</Link></li>
            <li><Link to="/shop?filter=best" className="hover:text-primary transition-colors">Best Sellers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link to="/reach-us" className="hover:text-primary transition-colors">Reach Us</Link></li>
            <li><Link to="/policies/cookies" className="hover:text-primary transition-colors">Cookies Policy</Link></li>
            <li><Link to="/policies/order-cancellation" className="hover:text-primary transition-colors">Order Cancellation</Link></li>
            <li><Link to="/policies/payment-security" className="hover:text-primary transition-colors">Payment & Security</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4">Reach Us</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> support@spotless.com</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> +1 (800) 555-CLEAN</li>
            <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Mon-Sat / 9 AM - 6 PM</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4">
        <p className="text-center text-xs text-muted-foreground">© 2026 Spotless Solutions. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
