import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RichTextRenderer from "@/components/RichTextRenderer";
import { POLICY_DEFS } from "@/lib/policies";
import { policiesService } from "@/services/policiesService";

/**
 * Public policy page — renders saved HTML for a given slug from the backend.
 * Usage: <PolicyPage slug="cookies-policy" />
 */
const PolicyPage = ({ slug }) => {
  const def = POLICY_DEFS[slug];
  const [content, setContent] = useState("");
  const [title, setTitle] = useState(def?.title || "Policy");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = `${def?.title || "Policy"} · Spotless Solutions`;
    let active = true;
    setLoading(true);
    policiesService
      .getPublic(slug)
      .then((policy) => {
        if (!active) return;
        setContent(policy.content || "");
        if (policy.title) setTitle(policy.title);
      })
      .catch(() => {
        if (active) setContent("");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, def]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10 sm:py-14 max-w-4xl">
          <header className="mb-8">
            <p className="text-xs font-semibold tracking-wider text-primary uppercase mb-2">Spotless Solutions</p>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground">{title}</h1>
          </header>
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

export default PolicyPage;
