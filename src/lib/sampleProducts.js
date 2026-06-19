// Dev-only fallback sample products. Used by Shop.jsx when the backend
// returns zero products so the UI is never blank during development.
// TODO: Remove this file once the backend has real product data.
import catLiquids from "@/assets/cat-liquids.png";
import catGloves from "@/assets/cat-gloves.png";
import catMasks from "@/assets/cat-masks.png";
import catCarkits from "@/assets/cat-carkits.png";
import catTools from "@/assets/cat-tools.png";
import catKitchen from "@/assets/cat-kitchen.png";

export const SAMPLE_PRODUCTS = [
  { id: "s1", slug: "multi-surface-cleaner-500ml", name: "Premium Multi-Surface Cleaner Spray 500ml", category: "Cleaning Liquids", categorySlug: "cleaning-liquids", price: 249, originalPrice: 499, image: catLiquids, tags: ["bestseller"] },
  { id: "s2", slug: "heavy-duty-rubber-gloves", name: "Heavy Duty Rubber Gloves – Reusable Pair", category: "Gloves", categorySlug: "gloves", price: 149, originalPrice: 299, image: catGloves, tags: ["new"] },
  { id: "s3", slug: "n95-mask-pack-10", name: "N95 Protective Mask – Pack of 10", category: "Masks & Safety", categorySlug: "masks", price: 399, originalPrice: 599, image: catMasks, tags: ["bestseller"] },
  { id: "s4", slug: "car-cleaning-kit-8pc", name: "Complete Car Cleaning Kit – 8 Piece Set", category: "Car Cleaning", categorySlug: "car-kits", price: 899, originalPrice: 1499, image: catCarkits, tags: ["sale"] },
  { id: "s5", slug: "microfiber-mop-extendable", name: "Microfiber Mop with Extendable Handle", category: "Cleaning Tools", categorySlug: "tools", price: 599, originalPrice: 999, image: catTools, tags: ["new"] },
  { id: "s6", slug: "kitchen-degreaser-750ml", name: "Kitchen Degreaser Spray – Lemon Fresh 750ml", category: "Kitchen Care", categorySlug: "kitchen", price: 199, originalPrice: 349, image: catKitchen, tags: ["sale"] },
  { id: "s7", slug: "glass-window-cleaner-1l", name: "Glass & Window Cleaning Liquid 1L", category: "Cleaning Liquids", categorySlug: "cleaning-liquids", price: 179, originalPrice: 350, image: catLiquids, tags: ["sale"] },
  { id: "s8", slug: "eco-sponge-pack-6", name: "Eco-Friendly Sponge Set – Pack of 6", category: "Kitchen Care", categorySlug: "kitchen", price: 129, originalPrice: 249, image: catKitchen, tags: ["new"] },
  { id: "s9", slug: "nitrile-gloves-100", name: "Disposable Nitrile Gloves – Box of 100", category: "Gloves", categorySlug: "gloves", price: 549, originalPrice: 799, image: catGloves, tags: ["bestseller"] },
  { id: "s10", slug: "floor-disinfectant-2l", name: "Floor Disinfectant Concentrate 2L", category: "Cleaning Liquids", categorySlug: "cleaning-liquids", price: 329, originalPrice: 549, image: catLiquids, tags: ["bestseller"] },
  { id: "s11", slug: "car-wax-polish-300ml", name: "Car Wax & Polish 300ml", category: "Car Cleaning", categorySlug: "car-kits", price: 449, originalPrice: 699, image: catCarkits, tags: ["new"] },
  { id: "s12", slug: "scrub-brush-set", name: "Heavy Duty Scrub Brush Set – 3 Pack", category: "Cleaning Tools", categorySlug: "tools", price: 229, originalPrice: 399, image: catTools, tags: ["sale"] },
];

// Apply Shop.jsx filters/sort to the sample list so the UX feels real.
export function filterSampleProducts({ search, category, tag, max_price, sort }) {
  let list = [...SAMPLE_PRODUCTS];
  if (search) {
    const q = search.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }
  if (category) {
    list = list.filter((p) => p.categorySlug === category);
  }
  if (tag) {
    list = list.filter((p) => (p.tags || []).includes(tag.toLowerCase()));
  }
  if (typeof max_price === "number") {
    list = list.filter((p) => p.price <= max_price);
  }
  switch (sort) {
    case "price_asc": list.sort((a, b) => a.price - b.price); break;
    case "price_desc": list.sort((a, b) => b.price - a.price); break;
    case "rating": /* no rating field on samples */ break;
    default: break;
  }
  return list;
}
