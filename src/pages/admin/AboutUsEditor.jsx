import { useEffect, useRef, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import RichTextEditor from "@/components/RichTextEditor";
import RichTextRenderer from "@/components/RichTextRenderer";
import { MAX_ABOUT_IMAGES } from "@/lib/policies";
import { policiesService } from "@/services/policiesService";
import { validateImage, fileToDataUrl, formatGuideline, IMAGE_PRESETS } from "@/lib/imageValidation";
import { Save, CheckCircle2, Upload, X, Eye, Image as ImageIcon } from "lucide-react";

const SLUG = "about-us";
const SLIDESHOW_PRESET = IMAGE_PRESETS.slideshow;

// Image item shape: { key, url, path? (existing on server), file? (new upload) }
const newKey = (file) =>
  (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : `new-${file.name}-${file.size}-${file.lastModified}`;

const AboutUsEditor = () => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    policiesService
      .getAdmin(SLUG)
      .then((policy) => {
        if (!active) return;
        setContent(policy.content || "");
        setImages((policy.images || []).map((img) => ({ key: img.path, path: img.path, url: img.url })));
      })
      .catch((err) => {
        if (active) setError(err?.message || "Unable to load About Us content.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleFiles = async (files) => {
    setError("");
    const remaining = MAX_ABOUT_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`You can upload up to ${MAX_ABOUT_IMAGES} images.`);
      return;
    }
    const list = Array.from(files).slice(0, remaining);
    const accepted = [];
    const rejected = [];
    for (const file of list) {
      // eslint-disable-next-line no-await-in-loop
      const result = await validateImage(file, SLIDESHOW_PRESET);
      if (result.ok) {
        // eslint-disable-next-line no-await-in-loop
        const url = await fileToDataUrl(file);
        accepted.push({ key: newKey(file), file, url });
      } else {
        rejected.push(`${file.name}: ${result.error}`);
      }
    }
    if (accepted.length > 0) {
      setImages((prev) => [...prev, ...accepted].slice(0, MAX_ABOUT_IMAGES));
    }
    if (rejected.length > 0) {
      setError(rejected.join(" · "));
    }
  };

  const removeImage = (key) => setImages((prev) => prev.filter((img) => img.key !== key));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const keepImages = images.filter((img) => img.path).map((img) => img.path);
      const files = images.filter((img) => img.file).map((img) => img.file);
      const updated = await policiesService.update(SLUG, { content, keepImages, files });
      setContent(updated.content || "");
      setImages((updated.images || []).map((img) => ({ key: img.path, path: img.path, url: img.url })));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err?.message || "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const atLimit = images.length >= MAX_ABOUT_IMAGES;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/30 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-foreground">About Us</h2>
            <p className="text-sm text-muted-foreground">Manage About Us content and slideshow images (max {MAX_ABOUT_IMAGES}).</p>
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

        {error && <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm break-words">{error}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 bg-card rounded-xl shadow-card p-4 sm:p-6 min-w-0">
            <h3 className="font-display font-bold text-lg mb-3">Content</h3>
            {loading ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
            ) : preview ? (
              <RichTextRenderer html={content} />
            ) : (
              <RichTextEditor value={content} onChange={setContent} />
            )}
          </section>

          <section className="bg-card rounded-xl shadow-card p-4 sm:p-6 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-lg">Slideshow Images</h3>
              <span className={`text-xs font-medium ${atLimit ? "text-destructive" : "text-muted-foreground"}`}>
                {images.length}/{MAX_ABOUT_IMAGES}
              </span>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={atLimit}
              className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-6 h-6" />
              <span className="text-sm font-medium">
                {atLimit ? "Limit reached" : "Click to upload images"}
              </span>
            </button>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              {formatGuideline(SLIDESHOW_PRESET)} · up to {MAX_ABOUT_IMAGES} images
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {images.map((img) => (
                <div key={img.key} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={img.url} alt="About slideshow" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(img.key)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {images.length === 0 && (
                <div className="col-span-full text-center text-xs text-muted-foreground py-6 flex flex-col items-center gap-2">
                  <ImageIcon className="w-6 h-6 opacity-50" />
                  No images yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AboutUsEditor;
