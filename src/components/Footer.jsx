import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="font-display font-bold text-lg text-foreground mb-4">Spotless Solutions</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your one-stop shop for premium cleaning supplies. From household essentials to professional-grade products.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop" className="hover:text-primary transition-colors">All Products</Link></li>
            <li><Link to="/shop?filter=new" className="hover:text-primary transition-colors">New Arrivals</Link></li>
            <li><Link to="/shop?filter=sale" className="hover:text-primary transition-colors">On Sale</Link></li>
            <li><Link to="/shop?filter=best" className="hover:text-primary transition-colors">Best Sellers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4">Policies</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><span className="hover:text-primary transition-colors cursor-pointer">Terms & Conditions</span></li>
            <li><span className="hover:text-primary transition-colors cursor-pointer">Shipping Policy</span></li>
            <li><span className="hover:text-primary transition-colors cursor-pointer">Return & Refund</span></li>
            <li><span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4">Reach Us</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Email: support@spotless.com</li>
            <li>Phone: +1 (800) 555-CLEAN</li>
            <li>Mon-Sat / 9:00 AM - 6:00 PM</li>
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
