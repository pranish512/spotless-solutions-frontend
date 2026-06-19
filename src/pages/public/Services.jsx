import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, Sparkles } from "lucide-react";
import { apiRequest } from "@/services/api";

const HERO_BG =
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1920&q=80";

const mapService = (item) => ({
  id: item.id,
  slug: item.slug,
  name: item.name,
  description: item.description || "",
  image: item.image_url || "",
  brochureName: item.brochure_name || "",
  brochureUrl: item.brochure_url || "",
});

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Our Services · Spotless Solutions";
    let active = true;
    (async () => {
      try {
        const response = await apiRequest("/services?limit=100");
        if (!active) return;
        setServices((response?.items || []).map(mapService));
      } catch (err) {
        if (active) setError(err?.message || "Unable to load services.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero — parallax fixed background */}
      <section
        className="relative h-[60vh] min-h-[360px] flex items-center justify-center text-center bg-fixed bg-center bg-cover"
        style={{ backgroundImage: `linear-gradient(rgba(10,18,32,0.7), rgba(10,18,32,0.75)), url(${HERO_BG})` }}
      >
        <div className="container mx-auto px-4 text-white">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-primary-foreground/90 bg-primary/30 backdrop-blur px-3 py-1 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" /> What we do
          </p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-4">Professional Services, Spotless Results</h1>
          <p className="max-w-2xl mx-auto text-white/80 text-base sm:text-lg">
            Trusted facility, hygiene and manpower solutions engineered for modern businesses — delivered with safety, consistency and pride.
          </p>
        </div>
      </section>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 sm:py-20 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground">Services We Offer</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Explore our full range of corporate cleaning and facility services, each tailored for measurable outcomes.
            </p>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground py-16">Loading services…</div>
          ) : error ? (
            <div className="text-center text-destructive py-16">{error}</div>
          ) : services.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">No services are available right now.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <Link key={s.id} to={`/services/${s.slug}`}
                  className="group bg-card rounded-2xl shadow-card overflow-hidden border border-border/60 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    <img src={s.image} alt={s.name} loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">{s.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{(s.description || "").replace(/<[^>]*>/g, "").trim()}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Learn more <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Services;
