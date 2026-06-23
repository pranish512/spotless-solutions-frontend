import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useReachUs } from "@/hooks/useReachUs";
import { Mail, Phone, Clock, MapPin } from "lucide-react";

const ReachUs = () => {
  const reach = useReachUs();

  useEffect(() => {
    document.title = "Reach Us · Spotless Solutions";
  }, []);

  const rows = [
    { key: "email", icon: Mail, label: "Email", value: reach.email, href: reach.email ? `mailto:${reach.email}` : null },
    { key: "phone", icon: Phone, label: "Phone", value: reach.phone, href: reach.phone ? `tel:${reach.phone.replace(/[^+\d]/g, "")}` : null },
    { key: "availability", icon: Clock, label: "Availability", value: reach.availability },
    { key: "location", icon: MapPin, label: "Head Office", value: reach.location },
  ].filter((r) => r.value);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10 sm:py-14 max-w-3xl">
          <header className="mb-8">
            <p className="text-xs font-semibold tracking-wider text-primary uppercase mb-2">Spotless Solutions</p>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground">Reach Us</h1>
            <p className="text-muted-foreground mt-2">We'd love to hear from you — here's how to get in touch.</p>
          </header>

          <div className="bg-card rounded-2xl shadow-card p-6 sm:p-8 divide-y divide-border">
            {rows.length === 0 ? (
              <p className="text-muted-foreground">Contact details coming soon.</p>
            ) : (
              rows.map((r) => (
                <div key={r.key} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <r.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{r.label}</p>
                    {r.href ? (
                      <a href={r.href} className="text-foreground font-medium hover:text-primary transition-colors break-words">{r.value}</a>
                    ) : (
                      <p className="text-foreground font-medium whitespace-pre-line break-words">{r.value}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReachUs;
