import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import RichTextEditor from "@/components/RichTextEditor";
import RichTextRenderer from "@/components/RichTextRenderer";
import { reachUsService } from "@/lib/reachUs";
import { Save, Eye, CheckCircle2, MapPin } from "lucide-react";

/**
 * Reach Us — single-record content editor. Loads existing content automatically
 * and updates the same record on save (no duplicate rows are created).
 */
const ReachUsEditor = () => {
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    // TODO: API INTEGRATION -> GET /api/admin/reach-us
    setContent(reachUsService.get().content || "");
  }, []);

  const handleSave = () => {
    // TODO: API INTEGRATION -> PUT /api/admin/reach-us
    reachUsService.save({ content });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/30 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" /> Reach Us
            </h2>
            <p className="text-sm text-muted-foreground">Manage the contact / reach-us content displayed to customers.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPreview((p) => !p)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-foreground font-display font-bold text-sm hover:bg-muted">
              <Eye className="w-4 h-4" /> {preview ? "Edit" : "Preview"}
            </button>
            <button onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90">
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

export default ReachUsEditor;
