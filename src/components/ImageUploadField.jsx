import { useRef, useState } from "react";
import { Upload, ImageIcon, X } from "lucide-react";
import { validateImage, fileToDataUrl, formatGuideline, IMAGE_PRESETS } from "@/lib/imageValidation";

/**
 * Reusable image-upload field with built-in guideline + smart validation.
 *
 * Props:
 *  - label: field label
 *  - required: bool
 *  - presetKey: key of IMAGE_PRESETS ("service" | "product" | "banner" | "hero" | "about" | "profile")
 *  - preset: optional custom { width, height, maxMB, label }
 *  - value: current preview URL / data URL
 *  - onChange: (file, dataUrl) => void  — emits both for parents to upload
 *  - aspectClass: tailwind class to control preview aspect (default "aspect-[3/2]")
 */
const ImageUploadField = ({
  label = "Image",
  required = false,
  presetKey = "service",
  preset,
  value = "",
  onChange,
  aspectClass = "aspect-[3/2]",
}) => {
  const config = preset || IMAGE_PRESETS[presetKey] || IMAGE_PRESETS.service;
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handlePick = async (file) => {
    if (!file) return;
    setError("");
    setBusy(true);
    const result = await validateImage(file, config);
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    onChange?.(file, dataUrl);
    setBusy(false);
  };

  const handleClear = () => {
    setError("");
    if (inputRef.current) inputRef.current.value = "";
    onChange?.(null, "");
  };

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">
        {label} {required && "*"}
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handlePick(e.target.files?.[0])}
      />

      {value ? (
        <div className={`relative w-full ${aspectClass} rounded-lg overflow-hidden border border-border bg-muted`}>
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/90 hover:bg-background flex items-center justify-center text-foreground shadow"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 px-3 h-8 rounded-md bg-background/90 hover:bg-background text-xs font-medium text-foreground shadow"
          >
            <Upload className="w-3.5 h-3.5" /> Replace
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={`w-full ${aspectClass} max-h-48 rounded-lg border border-dashed border-border bg-background hover:bg-muted/40 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground transition-colors`}
        >
          <ImageIcon className="w-6 h-6" />
          <span className="font-medium">{busy ? "Validating…" : "Upload image"}</span>
          <span className="text-xs">Click to choose a file</span>
        </button>
      )}

      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
        {formatGuideline(config)}
      </p>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
};

export default ImageUploadField;
