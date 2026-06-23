import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RichTextRenderer from "@/components/RichTextRenderer";
import { policiesService } from "@/services/policiesService";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLUG = "about-us";

const Slideshow = ({ images }) => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(t);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-muted shadow-card">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`About slide ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {images.length > 1 && (
        <>
          <button
            onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/40 text-white shadow-lg transition-all"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % images.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/40 text-white shadow-lg transition-all"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? "w-6 bg-white" : "w-1.5 bg-white/60"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const AboutUs = () => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "About Us · Spotless Solutions";
    let active = true;
    setLoading(true);
    policiesService
      .getPublic(SLUG)
      .then((policy) => {
        if (!active) return;
        setContent(policy.content || "");
        setImages((policy.images || []).map((img) => img.url).filter(Boolean));
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10 sm:py-14 max-w-5xl">
          <header className="mb-8 text-center">
            <p className="text-xs font-semibold tracking-wider text-primary uppercase mb-2">Our Story</p>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground">About Spotless Solutions</h1>
          </header>

          {images.length > 0 && (
            <div className="mb-10">
              <Slideshow images={images} />
            </div>
          )}

          <article className="bg-card rounded-2xl shadow-card p-6 sm:p-10">
            {loading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : (
              <RichTextRenderer html={content} />
            )}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;
