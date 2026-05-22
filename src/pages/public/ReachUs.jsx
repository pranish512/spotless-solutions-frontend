import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RichTextRenderer from "@/components/RichTextRenderer";
import { reachUsService } from "@/lib/reachUs";

const ReachUs = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    document.title = "Reach Us · Spotless Solutions";
    // TODO: API INTEGRATION -> GET /api/reach-us
    setContent(reachUsService.get().content || "");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10 sm:py-14 max-w-4xl">
          <header className="mb-8">
            <p className="text-xs font-semibold tracking-wider text-primary uppercase mb-2">Spotless Solutions</p>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground">Reach Us</h1>
          </header>
          <article className="bg-card rounded-2xl shadow-card p-6 sm:p-10">
            <RichTextRenderer html={content} />
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReachUs;
