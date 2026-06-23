import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import RichTextEditor from "@/components/RichTextEditor";
import RichTextRenderer from "@/components/RichTextRenderer";
import { POLICY_DEFS } from "@/lib/policies";
import { policiesService } from "@/services/policiesService";
import { Save, Eye, CheckCircle2 } from "lucide-react";

/**
 * Generic single-record policy editor. Routed via /admin/policies/:slug.
 * Loads existing content from the backend and updates the same record on save.
 */
const PolicyEditor = () => {
  const { slug } = useParams();
  const def = POLICY_DEFS[slug];
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!def || def.slug === "about-us") return;
    let active = true;
    setLoading(true);
    setError("");
    policiesService
      .getAdmin(def.slug)
      .then((policy) => {
        if (active) setContent(policy.content || "");
      })
      .catch((err) => {
        if (active) setError(err?.message || "Unable to load this policy.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [def]);

  if (!def || def.slug === "about-us") {
    // About Us has its own dedicated editor (with image uploads).
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await policiesService.update(def.slug, { content });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err?.message || "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
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
              disabled={saving || loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        {error && <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}

        <div className="bg-card rounded-xl shadow-card p-4 sm:p-6">
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
          ) : preview ? (
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
