import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import RichTextEditor from "@/components/RichTextEditor";
import { POLICY_DEFS, policiesService } from "@/lib/policies";
import { Save, Eye, CheckCircle2 } from "lucide-react";
import RichTextRenderer from "@/components/RichTextRenderer";

/**
 * Generic single-record policy editor. Routed via /admin/policies/:slug.
 * Loads existing content automatically and updates the same record on save.
 */
const PolicyEditor = () => {
  const { slug } = useParams();
  const def = POLICY_DEFS[slug];
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!def) return;
    // TODO: API INTEGRATION -> GET /api/admin/policies/{slug}
    const existing = policiesService.get(def.slug);
    setContent(existing.content || "");
  }, [def]);

  if (!def || def.slug === "about-us") {
    // About Us has its own dedicated editor (with image uploads).
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSave = () => {
    // TODO: API INTEGRATION -> PUT /api/admin/policies/{slug}
    policiesService.save(def.slug, { content });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/30 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-foreground">{def.title}</h2>
            <p className="text-sm text-muted-foreground">Edit the content shown to customers on the public page.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview((p) => !p)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-foreground font-display font-bold text-sm hover:bg-muted"
            >
              <Eye className="w-4 h-4" /> {preview ? "Edit" : "Preview"}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90"
            >
              {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-card p-4 sm:p-6">
          {preview ? (
            <RichTextRenderer html={content} />
          ) : (
            <RichTextEditor value={content} onChange={setContent} />
          )}
        </div>
      </main>
    </div>
  );
};

export default PolicyEditor;
