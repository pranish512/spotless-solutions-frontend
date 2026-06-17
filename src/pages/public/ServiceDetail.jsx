import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RichTextRenderer from "@/components/RichTextRenderer";
import {
  Download, FileText, ShieldCheck, Users, BadgeCheck, Headphones,
  CheckCircle2, ArrowRight, Phone, Mail, MessageSquare, Building2, Factory, GraduationCap, Hospital,
} from "lucide-react";
import { getActiveServices, getServiceBySlug } from "@/lib/services";

const stripHtml = (html) => (html || "").replace(/<[^>]*>/g, "").trim();

const HERO_BG =
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1920&q=80";

const trustBlocks = [
  { icon: BadgeCheck, title: "Quality Assurance", body: "Audited SOPs and supervisor checklists on every shift." },
  { icon: Users, title: "Experienced Team", body: "Background-verified, trained and uniformed professionals." },
  { icon: ShieldCheck, title: "Safety Compliance", body: "MSDS-driven chemical handling and PPE standards." },
  { icon: Headphones, title: "Flexible Support", body: "24×7 escalation desk with single point of contact." },
];

const industries = [
  { icon: Building2, label: "Corporate Offices" },
  { icon: Factory, label: "Manufacturing" },
  { icon: Hospital, label: "Healthcare" },
  { icon: GraduationCap, label: "Education" },
];

const ServiceDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [all, setAll] = useState([]);

  useEffect(() => {
    // TODO: API INTEGRATION -> GET /api/services/{slug}
    const list = getActiveServices();
    setAll(list);
    const found = getServiceBySlug(slug);
    setService(found || null);
    document.title = found ? `${found.name} · Spotless Solutions` : "Service · Spotless Solutions";
  }, [slug]);

  const related = useMemo(() => all.filter((s) => s.slug !== slug).slice(0, 3), [all, slug]);

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-20 text-center">
          <h1 className="font-display font-bold text-2xl text-foreground">Service not found</h1>
          <p className="text-muted-foreground mt-2">The service you’re looking for is no longer available.</p>
          <button onClick={() => navigate("/services")}
            className="mt-6 inline-flex items-center gap-2 px-5 h-11 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm">
            Browse all services <ArrowRight className="w-4 h-4" />
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const handleDownload = () => {
    if (service.brochureUrl) {
      const a = document.createElement("a");
      a.href = service.brochureUrl;
      a.download = service.brochureName || "brochure.pdf";
      document.body.appendChild(a); a.click(); a.remove();
    } else {
      // No file uploaded yet — gracefully no-op.
      alert("Brochure will be available shortly.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Parallax hero band */}
      <div
        className="bg-fixed bg-center bg-cover"
        style={{ backgroundImage: `linear-gradient(rgba(8,15,30,0.78), rgba(8,15,30,0.82)), url(${HERO_BG})` }}
      >
        <section className="container mx-auto px-4 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="text-white">
              <nav className="text-xs text-white/70 mb-4">
                <Link to="/" className="hover:text-white">Home</Link>
                <span className="mx-2">/</span>
                <Link to="/services" className="hover:text-white">Services</Link>
                <span className="mx-2">/</span>
                <span className="text-white">{service.name}</span>
              </nav>
              <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight">{service.name}</h1>
              <p className="mt-5 text-white/85 text-base sm:text-lg leading-relaxed line-clamp-5">{stripHtml(service.description)}</p>

              <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                {["Trained & uniformed staff", "Modern equipment", "Hospital-grade chemicals", "Transparent SLAs"].map((b) => (
                  <li key={b} className="flex items-start gap-2 text-white/90">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> {b}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={handleDownload}
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity">
                  <Download className="w-4 h-4" /> Download Brochure
                </button>
                <Link to="/reach-us"
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-lg border border-white/30 text-white font-display font-bold text-sm hover:bg-white/10 transition-colors">
                  <MessageSquare className="w-4 h-4" /> Get a Quote
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-3 rounded-3xl bg-primary/20 blur-2xl" aria-hidden />
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-muted">
                <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <main className="flex-1">
        {/* Why choose us */}
        <section className="container mx-auto px-4 py-16 sm:py-20 max-w-6xl">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Why choose us</p>
            <h2 className="font-display font-bold text-3xl text-foreground mt-2">Built on trust, delivered with precision</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trustBlocks.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-card rounded-2xl border border-border/60 p-6 shadow-card hover:shadow-lg transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Service details */}
        <section className="bg-muted/40 border-y border-border/60">
          <div className="container mx-auto px-4 py-16 sm:py-20 max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">About this service</p>
              <h2 className="font-display font-bold text-3xl text-foreground mt-2">Detailed Overview</h2>
              <div className="mt-5"><RichTextRenderer html={service.description} /></div>

              <h3 className="font-display font-bold text-lg text-foreground mt-8 mb-3">Service Scope</h3>
              <ul className="space-y-2.5 text-sm text-foreground/85">
                {[
                  "Daily, periodic and on-demand service schedules",
                  "Dedicated supervisor with shift reporting",
                  "Standardised consumables and equipment list",
                  "Quarterly performance reviews with measurable KPIs",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> {t}
                  </li>
                ))}
              </ul>

              <h3 className="font-display font-bold text-lg text-foreground mt-8 mb-3">Customer Benefits</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-foreground/85">
                {[
                  "Lower operational overhead",
                  "Audit-ready documentation",
                  "Trained, compliant manpower",
                  "Single point of accountability",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <aside>
              <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Suitable for</p>
              <h3 className="font-display font-bold text-xl text-foreground mt-2 mb-5">Industries we serve</h3>
              <div className="grid grid-cols-2 gap-3">
                {industries.map(({ icon: Icon, label }) => (
                  <div key={label} className="bg-card rounded-xl border border-border/60 p-4 text-center shadow-card">
                    <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-xs font-medium text-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        {/* Brochure */}
        <section className="container mx-auto px-4 py-16 sm:py-20 max-w-5xl">
          <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-border/60 rounded-3xl p-8 sm:p-10 shadow-card flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
            <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <FileText className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Brochure</p>
              <h3 className="font-display font-bold text-2xl text-foreground mt-1">Download the full service brochure</h3>
              <p className="text-sm text-muted-foreground mt-1.5">
                {service.brochureName ? (
                  <>File: <span className="text-foreground font-medium">{service.brochureName}</span></>
                ) : "Brochure file will be available soon."}
              </p>
            </div>
            <button onClick={handleDownload}
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity">
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        </section>

        {/* Related services */}
        {related.length > 0 && (
          <section className="bg-muted/40 border-t border-border/60">
            <div className="container mx-auto px-4 py-16 sm:py-20 max-w-6xl">
              <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Explore</p>
                  <h2 className="font-display font-bold text-3xl text-foreground mt-2">Related Services</h2>
                </div>
                <Link to="/services" className="text-sm font-semibold text-primary inline-flex items-center gap-1.5">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((s) => (
                  <Link key={s.id} to={`/services/${s.slug}`}
                    className="group bg-card rounded-2xl shadow-card overflow-hidden border border-border/60 hover:shadow-lg transition-all">
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      <img src={s.image} alt={s.name} loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors">{s.name}</h3>
                      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="container mx-auto px-4 py-16 sm:py-20 max-w-5xl">
          <div className="rounded-3xl bg-foreground text-background p-8 sm:p-12 text-center shadow-2xl">
            <h2 className="font-display font-bold text-3xl sm:text-4xl">Ready to get started?</h2>
            <p className="mt-3 text-background/75 max-w-xl mx-auto">
              Talk to our specialists for a tailored proposal and a transparent quote — usually within one business day.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link to="/reach-us"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity">
                <Phone className="w-4 h-4" /> Contact Us
              </Link>
              <Link to="/reach-us"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-background/10 border border-background/20 text-background font-display font-bold text-sm hover:bg-background/20 transition-colors">
                <Mail className="w-4 h-4" /> Request Quote
              </Link>
              <Link to="/reach-us"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-background/10 border border-background/20 text-background font-display font-bold text-sm hover:bg-background/20 transition-colors">
                <MessageSquare className="w-4 h-4" /> Service Enquiry
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceDetail;
