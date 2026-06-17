// Smart image validation: file-type, size and aspect-ratio guard.
// Used by ImageUploadField across services / products / about / profile / banners.

export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

// Common presets so screens stay consistent.
export const IMAGE_PRESETS = {
  service:   { width: 1200, height: 800,  maxMB: 5, label: "Service image" },
  product:   { width: 1000, height: 1000, maxMB: 5, label: "Product image" },
  banner:    { width: 1920, height: 720,  maxMB: 5, label: "Banner image" },
  hero:      { width: 1920, height: 1080, maxMB: 5, label: "Hero image" },
  about:     { width: 1600, height: 900,  maxMB: 5, label: "About us image" },
  profile:   { width: 512,  height: 512,  maxMB: 2, label: "Profile photo" },
};

const ASPECT_TOLERANCE = 0.05; // 5% — keep 95% aspect-ratio accuracy
const MIN_SHORT_SIDE_RATIO = 0.5; // do not allow images smaller than 50% of target

const readImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Unable to read image")); };
    img.src = url;
  });

/**
 * Validate an uploaded image file against a preset.
 * Returns { ok: true, width, height } or { ok: false, error }.
 *
 * Smart aspect-ratio check: allows any dimensions provided the ratio is
 * within 5% of the recommended one and the image is not drastically smaller.
 */
export const validateImage = async (file, preset) => {
  if (!file) return { ok: false, error: "Please choose an image." };
  if (!IMAGE_TYPES.includes(file.type)) {
    return { ok: false, error: "Only JPG, PNG or WEBP images are supported." };
  }
  if (file.size > preset.maxMB * 1024 * 1024) {
    return { ok: false, error: `Image must be under ${preset.maxMB} MB.` };
  }
  try {
    const img = await readImage(file);
    const targetRatio = preset.width / preset.height;
    const actualRatio = img.width / img.height;
    const diff = Math.abs(actualRatio - targetRatio) / targetRatio;
    if (diff > ASPECT_TOLERANCE) {
      return {
        ok: false,
        error: `Aspect ratio mismatch — recommended ${preset.width}×${preset.height} (your image is ${img.width}×${img.height}). It would appear stretched or cropped.`,
      };
    }
    if (
      img.width < preset.width * MIN_SHORT_SIDE_RATIO ||
      img.height < preset.height * MIN_SHORT_SIDE_RATIO
    ) {
      return {
        ok: false,
        error: `Image is too small — please upload at least ${Math.round(preset.width * MIN_SHORT_SIDE_RATIO)}×${Math.round(preset.height * MIN_SHORT_SIDE_RATIO)}px.`,
      };
    }
    return { ok: true, width: img.width, height: img.height };
  } catch (err) {
    return { ok: false, error: "We couldn't read that image. Try another file." };
  }
};

export const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

export const formatGuideline = (preset) =>
  `Recommended: ${preset.width}×${preset.height}px · JPG / PNG / WEBP · Max ${preset.maxMB} MB`;
