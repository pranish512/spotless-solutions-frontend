import { useEffect, useRef, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import RichTextEditor from "@/components/RichTextEditor";
import RichTextRenderer from "@/components/RichTextRenderer";
import { policiesService, MAX_ABOUT_IMAGES } from "@/lib/policies";
import { validateImage, fileToDataUrl, formatGuideline, IMAGE_PRESETS } from "@/lib/imageValidation";
import { Save, CheckCircle2, Upload, X, Eye, Image as ImageIcon } from "lucide-react";

const SLUG = "about-us";
const SLIDESHOW_PRESET = IMAGE_PRESETS.slideshow;

const AboutUsEditor = () => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    // TODO: API INTEGRATION -> GET /api/admin/policies/about-us
    const existing = policiesService.get(SLUG);
    setContent(existing.content || "");
    setImages(policiesService.getAboutImages());
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
      const result = await validateImage(file, SLIDESHOW_PRESET);
      if (result.ok) {
        // eslint-disable-next-line no-await-in-loop
        accepted.push(await fileToDataUrl(file));
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

  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    // TODO: API INTEGRATION -> PUT /api/admin/policies/about-us  (multipart: content + images[])
    policiesService.save(SLUG, { content });
    policiesService.saveAboutImages(images);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const atLimit = images.length >= MAX_ABOUT_IMAGES;

  return (
    <div className="flex min-h-screen">
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90"
            >
              {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 bg-card rounded-xl shadow-card p-4 sm:p-6 min-w-0">
            <h3 className="font-display font-bold text-lg mb-3">Content</h3>
            {preview ? (
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

            {error && <p className="mt-2 text-xs text-destructive break-words">{error}</p>}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {images.map((src, i) => (
                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={src} alt={`About ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
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
