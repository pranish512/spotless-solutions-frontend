# Spotless Solutions — Static Assets & Design Guidelines

Use this as the single source of truth when uploading images, designing
forms, or building new screens. It mirrors the tokens defined in
`src/index.css` and `tailwind.config.ts`.

---

## 1. Image dimensions

| Asset | Recommended size | Aspect ratio | Notes |
|---|---|---|---|
| Product main image | **1200 × 1200 px** | 1 : 1 | White / neutral background |
| Product gallery | 1200 × 1200 px | 1 : 1 | Up to 6 images per product |
| Product thumbnail (card) | 600 × 600 px | 1 : 1 | Auto-derived from main |
| Product micro-thumbnail (cart) | 120 × 120 px | 1 : 1 | Auto-derived |
| Category circle icon | 256 × 256 px | 1 : 1 | Transparent PNG preferred |
| Hero banner (desktop) | 1920 × 720 px | 8 : 3 | Keep text in safe zone (center 60%) |
| Hero banner (mobile) | 750 × 900 px | 5 : 6 | Provide separate file when text-heavy |
| Profile picture (user / admin) | 512 × 512 px | 1 : 1 | Square, will be displayed as a circle |
| Tag icon | 64 × 64 px | 1 : 1 | Or single emoji |
| OG / share image | 1200 × 630 px | 1.91 : 1 | One per major page |

**Hard limits**

- Max single file size: **2 MB** for images, **20 MB** for videos.
- Min product image side: **800 px**.

---

## 2. File formats

### Images

| Format | Use for | Notes |
|---|---|---|
| `.webp` | Default for product / banner imagery | Best size-to-quality ratio |
| `.jpg` | Photographic fallback | Quality 80–85 |
| `.png` | Transparent assets, icons | Use only when transparency needed |
| `.svg` | Logos, line icons | Inline `<svg>` preferred |

Avoid `.gif`, `.bmp`, `.tiff`, and HEIC.

### Video

| Format | Use for | Notes |
|---|---|---|
| `.mp4` (H.264 + AAC) | Product demos | Default |
| `.webm` (VP9) | Optional second source | Better compression |

- Recommended demo length: **20–45 s**.
- Resolution: **1080p** (1920 × 1080), 30 fps.
- Provide a poster image (JPG, same dimensions).

---

## 3. UI standards

### 3.1 Spacing system

We use Tailwind's 4 px scale. Do **not** use arbitrary values like `p-[13px]`.

| Token | px | Use for |
|---|---|---|
| `space-y-1` / `gap-1` | 4 | Tight inline groups |
| `space-y-2` / `gap-2` | 8 | Form field internals |
| `space-y-4` / `gap-4` | 16 | **Default** between form fields |
| `space-y-6` / `gap-6` | 24 | Between form sections |
| `space-y-8` | 32 | Between page sections |
| `p-4` | 16 | Card / modal inner padding (mobile) |
| `p-6` | 24 | Card / modal inner padding (desktop) |
| `p-8` | 32 | Page main padding (desktop) |

### 3.2 Font sizes

Display family: **Plus Jakarta Sans** (`font-display`).
Body family: **DM Sans** (`font-body`).

| Token | px / line-height | Use for |
|---|---|---|
| `text-xs` | 12 / 16 | Captions, helper text |
| `text-sm` | 14 / 20 | Body, table cells, form labels |
| `text-base` | 16 / 24 | Inputs, main paragraph text |
| `text-lg` | 18 / 28 | Card titles |
| `text-xl` | 20 / 28 | Modal titles |
| `text-2xl` | 24 / 32 | Page titles |
| `text-3xl` | 30 / 36 | Marketing headers |
| `text-4xl`+ | 36+ | Hero only |

Headings always use `font-display font-bold`. Body uses `font-body`.

### 3.3 Button sizes

| Variant | Height | Padding | Radius | Use |
|---|---|---|---|---|
| Small | `h-9` | `px-3` | `rounded-md` | Table row actions |
| Default | `h-11` | `px-4` | `rounded-lg` | **Primary CTA, form submit** |
| Large | `h-12` | `px-6` | `rounded-lg` | Marketing / hero CTAs |
| Icon only | `w-9 h-9` | — | `rounded-md` | Edit / delete in tables |

Standard primary button:

```html
<button class="h-11 px-4 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity">
  Save
</button>
```

### 3.4 Icon usage

- Library: **lucide-react** only.
- Default size: `w-4 h-4` next to text, `w-5 h-5` standalone.
- Stroke width: default (2). Don't override per-icon.
- Color via `text-*` utility, never `fill=""`.
- Always pair an icon-only button with `aria-label`.

---

## 4. Responsive breakpoints

Tailwind defaults are used everywhere:

| Name | Min width | Target |
|---|---|---|
| (base) | 0 | Mobile portrait — single column, 16 px gutters |
| `sm:` | 640 px | Mobile landscape, large phones |
| `md:` | 768 px | Tablet portrait — 2-column forms |
| `lg:` | 1024 px | Tablet landscape, small laptops — sidebars appear |
| `xl:` | 1280 px | Desktop |
| `2xl:` | 1400 px | Large desktop — `container` caps here |

**Layout rules**

- Mobile-first: write base classes for mobile, then add `md:` / `lg:`.
- Page main padding: `p-4 md:p-6 lg:p-8`.
- Forms: `grid grid-cols-1 md:grid-cols-2 gap-4`.
- Tables: always wrap in `<div class="overflow-x-auto">`.
- Modals: `w-full max-w-2xl max-h-[90vh] overflow-y-auto`.
- Admin sidebar collapses below `lg:` and opens via a top-bar menu button.

---

## 5. Form design rules

### Label alignment

- Labels sit **above** inputs (never inline).
- Class: `block text-sm font-medium text-foreground mb-1`.
- Required fields are marked with a trailing `*` in the label, never with
  a separate asterisk component.

### Input sizes

| Field type | Class |
|---|---|
| Text / number / email / select | `w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body` |
| Textarea | Same as above but `py-2` instead of `h-11`, `resize-none`, explicit `rows` |
| Checkbox / radio | `w-4 h-4 accent-primary` |
| File input | `text-sm` (no custom border) |

### Error handling

- Error text appears **below** the input.
- Class: `mt-1 text-xs text-destructive`.
- Invalid inputs add the class `border-destructive focus:ring-destructive`.
- One error per field at a time. Form-level errors render in a
  `bg-destructive/10 text-destructive` banner above the form.

### Submit row

- Always last, separated from the form by `pt-2` or `border-t pt-4`.
- Two-button layout: `Cancel` (`flex-1 ... border ... hover:bg-muted`)
  on the left, primary submit on the right (`flex-1 ... bg-primary`).
- Submit label is **"Update"** when editing, **"Save ..."** when creating.

### Validation

- Validate on **blur** for individual fields, on **submit** for the whole form.
- Required fields use the native `required` attribute as a baseline.
- Numeric inputs use `type="number"` with `min` / `max` where applicable.
- GST is an integer field, range `0–28`.

---

## 6. Color tokens (reference)

Defined in `src/index.css`. Always reference via Tailwind classes
(`bg-primary`, `text-foreground`, ...) — never hard-code HSL or hex.

| Token | Light mode | Use |
|---|---|---|
| `--background` / `bg-background` | `0 0% 100%` | Page background |
| `--foreground` / `text-foreground` | `220 20% 10%` | Default text |
| `--primary` / `bg-primary` | `197 85% 45%` | Primary CTA |
| `--secondary` / `bg-secondary` | `45 100% 51%` | Highlights, ratings |
| `--accent` / `bg-accent` | `160 60% 45%` | Success, eco tags |
| `--destructive` / `bg-destructive` | `0 72% 51%` | Errors, delete |
| `--muted` / `bg-muted` | `210 20% 96%` | Card backgrounds, table head |
| `--border` / `border-border` | `220 13% 91%` | All borders |
| `--nav-bg` / `bg-nav` | `220 20% 10%` | Top nav, admin sidebar |

---

## 7. Asset checklist before upload

- [ ] Correct dimensions (Section 1)
- [ ] Correct format (Section 2)
- [ ] Compressed (`.webp` / `tinypng` for JPG/PNG)
- [ ] File name: `kebab-case`, no spaces, no uppercase
- [ ] Includes `alt` text when used in a component
- [ ] Lazy-loaded if below the fold (`loading="lazy"`)
