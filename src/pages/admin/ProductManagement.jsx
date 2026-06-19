import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ToggleSwitch from "@/components/ToggleSwitch";
import ConfirmDialog from "@/components/ConfirmDialog";
import ImageUploadField from "@/components/ImageUploadField";
import { useAuth } from "@/contexts/AuthContext";
import { adminMastersService } from "@/services/adminMastersService";
import { adminProductsService } from "@/services/adminProductsService";
import { Pencil, Trash2, Search, X, Upload, Eye, Star, Plus } from "lucide-react";

// TODO: API INTEGRATION -> GET /api/admin/products?page=1&search= => { products[], totalPages }
const initialProducts = [
  { id: "1", name: "Premium Multi-Surface Cleaner 500ml", category: "Cleaning Liquids", sellingPrice: 249, quantity: 150, active: true, avgRating: 4.5 },
  { id: "2", name: "Heavy Duty Rubber Gloves", category: "Gloves", sellingPrice: 149, quantity: 300, active: true, avgRating: 4.2 },
  { id: "3", name: "N95 Protective Mask – Pack of 10", category: "Masks & Safety", sellingPrice: 399, quantity: 0, active: false, avgRating: 4.8 },
  { id: "4", name: "Complete Car Cleaning Kit", category: "Car Cleaning", sellingPrice: 899, quantity: 45, active: true, avgRating: 4.6 },
  { id: "5", name: "Microfiber Mop with Handle", category: "Cleaning Tools", sellingPrice: 599, quantity: 80, active: true, avgRating: 4.0 },
];

// TODO: API INTEGRATION -> GET /api/admin/products/{id}/ratings => { avgRating, total, reviews: [{ id, user, rating, comment, date }] }
const sampleReviews = [
  { id: "r1", user: "Anita S.", rating: 5, comment: "Excellent quality, leaves surfaces shining.", date: "2026-04-12" },
  { id: "r2", user: "Rohit K.", rating: 4, comment: "Good product, value for money.", date: "2026-04-08" },
  { id: "r3", user: "Meera P.", rating: 5, comment: "Highly recommend, lasts a long time.", date: "2026-04-02" },
  { id: "r4", user: "Vikas D.", rating: 3, comment: "Average. Smell could be better.", date: "2026-03-28" },
];

// TODO: API INTEGRATION -> GET /api/admin/categories
const fallbackCategoryOptions = ["Cleaning Liquids", "Gloves", "Masks & Safety", "Car Cleaning", "Cleaning Tools", "Kitchen Care"];
// TODO: API INTEGRATION -> GET /api/admin/tags
const fallbackTagOptions = ["Eco-Friendly", "Best Seller", "New Arrival", "On Sale"];
const productTypes = ["Simple", "Variable size", "Bundle"];

const emptyForm = {
  name: "",
  description: "",
  highlights: "",
  tags: [],
  size: "",
  volume: "",
  sku: "",
  image: "",
  videoDemo: "",
  quantity: 0,
  category: fallbackCategoryOptions[0],
  actualPrice: 0,
  sellingPrice: 0,
  discount: 0,
  gstPercent: 18,
  barcode: "",
  manufacturer: "",
  hsn: "",
  productType: "Simple",
  bundleItems: [], // [{ productId, quantity }]
  enableRating: true,
  showRating: true,
};

const ProductManagement = () => {
  const { can } = useAuth();
  const canWrite = can("products", "write");
  const canDelete = can("products", "delete");
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState(fallbackCategoryOptions);
  const [tagOptions, setTagOptions] = useState(fallbackTagOptions);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!editingId;
  const refs = { categories, tags };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [categoryData, tagData] = await Promise.all([
          adminMastersService.listCategories({ limit: 100 }),
          adminMastersService.listTags({ limit: 100 }),
        ]);
        const activeCategories = categoryData.items.filter((category) => category.status === "Active");
        const activeTags = tagData.items.filter((tag) => tag.status === "Active");
        const nextRefs = { categories: categoryData.items, tags: tagData.items };

        setCategories(categoryData.items);
        setTags(tagData.items);
        setCategoryOptions(activeCategories.length ? activeCategories.map((category) => category.name) : fallbackCategoryOptions);
        setTagOptions(activeTags.length ? activeTags.map((tag) => tag.name) : fallbackTagOptions);

        // TODO: API INTEGRATION -> GET /api/admin/products?page=1&search=
        const data = await adminProductsService.listProducts({ limit: 100 }, nextRefs);
        setProducts(data.items);
      } catch (err) {
        setError(err.message || "Unable to load products.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, category: categoryOptions[0] || fallbackCategoryOptions[0] });
    setShowModal(true);
  };

  const openEdit = async (product) => {
    setError("");
    try {
      // TODO: API INTEGRATION -> GET /api/admin/products/{id}
      const detail = await adminProductsService.getProduct(product.id, refs);
      setEditingId(product.id);
      setForm({ ...emptyForm, ...detail });
      setShowModal(true);
    } catch (err) {
      setError(err.message || "Unable to load product.");
    }
  };

  const handleDelete = async () => {
    // TODO: API INTEGRATION -> DELETE /api/admin/products/{id} => { success }
    if (!canDelete) return;
    try {
      await adminProductsService.deleteProduct(confirmDeleteId);
      setProducts((prev) => prev.filter((p) => p.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err.message || "Unable to delete product.");
    }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const toggleActive = async (id) => {
    // TODO: API INTEGRATION -> PATCH /api/admin/products/{id}/status { active } => { product }
    if (!canWrite) return;
    const current = products.find((p) => p.id === id);
    if (!current) return;
    try {
      const updated = await adminProductsService.toggleProduct(id, !current.active, refs);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      setError(err.message || "Unable to update product status.");
    }
  };

  const toggleTag = (tag) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));
  };

  const addBundleItem = () => {
    const firstAvailable = products.find(
      (p) => !form.bundleItems.some((b) => b.productId === p.id)
    );
    if (!firstAvailable) return;
    setForm((f) => ({
      ...f,
      bundleItems: [...f.bundleItems, { productId: firstAvailable.id, quantity: 1 }],
    }));
  };

  const updateBundleItem = (index, patch) => {
    setForm((f) => ({
      ...f,
      bundleItems: f.bundleItems.map((b, i) => (i === index ? { ...b, ...patch } : b)),
    }));
  };

  const removeBundleItem = (index) => {
    setForm((f) => ({
      ...f,
      bundleItems: f.bundleItems.filter((_, i) => i !== index),
    }));
  };

  const handleImage = (file, dataUrl) => {
    // TODO: API INTEGRATION -> POST /api/admin/products/upload-image (multipart) => { url }
    setForm((f) => ({ ...f, image: dataUrl || "", imageFile: file || null }));
  };

  const handleVideo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: API INTEGRATION -> POST /api/admin/products/upload-video (multipart) => { url }
    setForm((f) => ({ ...f, videoDemo: URL.createObjectURL(file) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isEditing) {
        // TODO: API INTEGRATION -> PUT /api/admin/products/{id} { ...form } => { updatedProduct }
        const updated = await adminProductsService.updateProduct(editingId, form, refs);
        setProducts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
      } else {
        // TODO: API INTEGRATION -> POST /api/admin/products { ...form } => { product }
        const created = await adminProductsService.createProduct(form, refs);
        setProducts((prev) => [created, ...prev]);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowModal(false);
    } catch (err) {
      setError(err.message || "Unable to save product.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 bg-muted/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 md:mb-8">
          <h2 className="font-display font-bold text-2xl text-foreground">Product Management</h2>
          {canWrite && (
            <button
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          )}
        </div>

        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
          />
        </div>
        {error && <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}

        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Product</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Category</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Price</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Quantity</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Avg Rating</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading products...</td></tr>
                ) : filtered.map((product) => (
                  <tr key={product.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground max-w-xs truncate" title={product.name}>{product.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{product.category}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">₹{product.sellingPrice}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{product.quantity}</td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-4 h-4 fill-secondary text-secondary" />
                        <span className="font-medium">{(product.avgRating ?? 0).toFixed(1)}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ToggleSwitch
                        checked={product.active}
                        onChange={() => canWrite && toggleActive(product.id)}
                        labelOn="Active"
                        labelOff="Deactive"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* TODO: API INTEGRATION -> GET /api/admin/products/{id} => { product } (for popup) */}
                        <button
                          onClick={() => setPreviewProduct(product)}
                          className="p-2 rounded-md hover:bg-muted text-foreground transition-colors"
                          aria-label="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {/* TODO: API INTEGRATION -> PUT /api/admin/products/{id} { ...productData } => { updatedProduct } */}
                        {canWrite && (
                          <button
                            onClick={() => openEdit(product)}
                            className="p-2 rounded-md hover:bg-muted text-primary transition-colors"
                            aria-label="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setConfirmDeleteId(product.id)}
                            className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-card rounded-xl shadow-modal w-full max-w-4xl flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-fade-in overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky header */}
              <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-border shrink-0">
                <h3 className="font-display font-bold text-lg sm:text-xl text-foreground flex-1 min-w-0 truncate">
                  {isEditing ? "Edit Product" : "Add Product"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="shrink-0 p-1 rounded-md hover:bg-muted"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form className="flex flex-col flex-1 min-h-0" onSubmit={handleSave}>
                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
                      <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                      <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body resize-none" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-1">Product Highlights</label>
                      <textarea rows={2} value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                        placeholder="One highlight per line"
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body resize-none" />
                    </div>

                    {/* Tags */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-1">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {tagOptions.map((t) => {
                          const active = form.tags.includes(t);
                          return (
                            <button
                              type="button"
                              key={t}
                              onClick={() => toggleTag(t)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                active
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background text-foreground border-border hover:bg-muted"
                              }`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Variants / Units — now free-text inputs */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Size</label>
                      <input
                        value={form.size}
                        onChange={(e) => setForm({ ...form, size: e.target.value })}
                        placeholder="e.g. S / M / L / 30x40 cm"
                        className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Volume</label>
                      <input
                        value={form.volume}
                        onChange={(e) => setForm({ ...form, volume: e.target.value })}
                        placeholder="e.g. 500ml / 1L / 5L"
                        className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Product Code (SKU) *</label>
                      <input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Product Category *</label>
                      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body">
                        {categoryOptions.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>

                    {/* Image */}
                    <div className="md:col-span-2">
                      <ImageUploadField
                        label="Product Image"
                        presetKey="product"
                        value={form.image}
                        onChange={handleImage}
                        aspectClass="aspect-square"
                      />
                    </div>
                    {/* Video Demo */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Video Demo (upload or link)</label>
                      <input type="file" accept="video/*" onChange={handleVideo} className="text-sm mb-1 block w-full" />
                      <input
                        value={typeof form.videoDemo === "string" && form.videoDemo.startsWith("blob:") ? "" : form.videoDemo}
                        onChange={(e) => setForm({ ...form, videoDemo: e.target.value })}
                        placeholder="Or paste video URL"
                        className="w-full h-9 px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Available Quantity *</label>
                      <input required type="number" min="0" step="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Product Type *</label>
                      <select value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body">
                        {productTypes.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Actual Price (₹) *</label>
                      <input required type="number" min="0" step="0.01" value={form.actualPrice} onChange={(e) => setForm({ ...form, actualPrice: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Selling Price (₹) *</label>
                      <input required type="number" min="0" step="0.01" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Discount (%)</label>
                      <input type="number" min="0" max="100" step="1" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">GST (%)</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="28"
                        value={form.gstPercent}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            gstPercent: e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0,
                          })
                        }
                        placeholder="e.g. 18"
                        className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Barcode</label>
                      <input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Manufacturer</label>
                      <input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">HSN / SAC</label>
                      <input value={form.hsn} onChange={(e) => setForm({ ...form, hsn: e.target.value })}
                        className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body" />
                    </div>
                  </div>

                  {/* Bundle items — only when productType is Bundle */}
                  {form.productType === "Bundle" && (
                    <div className="border border-border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">Bundle Items</p>
                          <p className="text-xs text-muted-foreground">
                            Select the products included in this bundle and the quantity of each.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={addBundleItem}
                          className="inline-flex items-center gap-1 px-3 h-9 rounded-md border border-border text-sm hover:bg-muted"
                        >
                          <Plus className="w-4 h-4" /> Add item
                        </button>
                      </div>

                      {form.bundleItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">No items added yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {form.bundleItems.map((bi, idx) => (
                            <div
                              key={idx}
                              className="grid grid-cols-1 sm:grid-cols-[1fr_100px_auto] md:grid-cols-[1fr_120px_auto] gap-2 items-center"
                            >
                              {/* TODO: API INTEGRATION -> GET /api/admin/products?simpleOnly=true => { products[] } */}
                              <select
                                value={bi.productId}
                                onChange={(e) => updateBundleItem(idx, { productId: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body text-sm"
                              >
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                              <input
                                type="number"
                                min="1"
                                value={bi.quantity}
                                onChange={(e) =>
                                  updateBundleItem(idx, {
                                    quantity: parseInt(e.target.value, 10) || 1,
                                  })
                                }
                                className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body text-sm"
                                placeholder="Qty"
                              />
                              <button
                                type="button"
                                onClick={() => removeBundleItem(idx)}
                                className="p-2 rounded-md text-destructive hover:bg-destructive/10 justify-self-start sm:justify-self-auto"
                                aria-label="Remove bundle item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rating Controls */}
                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-medium text-foreground mb-2">Rating Settings</p>
                    <div className="flex flex-wrap gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.enableRating}
                          onChange={(e) => setForm({ ...form, enableRating: e.target.checked })}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-ring"
                        />
                        <span className="text-sm text-foreground">Enable Rating</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.showRating}
                          onChange={(e) => setForm({ ...form, showRating: e.target.checked })}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-ring"
                        />
                        <span className="text-sm text-foreground">Show Rating</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Sticky footer */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 px-4 sm:px-6 py-4 border-t border-border bg-card shrink-0">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="sm:flex-1 h-11 rounded-lg border border-border text-foreground font-display font-bold text-sm hover:bg-muted transition-colors">
                    Cancel
                  </button>
                  <button type="submit"
                    className="sm:flex-1 h-11 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity">
                    {isEditing ? "Update" : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Product Detail Preview Popup */}
        {previewProduct && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setPreviewProduct(null)}
          >
            <div
              className="bg-card rounded-xl shadow-modal w-full max-w-2xl my-8 animate-fade-in flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h3 className="font-display font-bold text-xl text-foreground">{previewProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">{previewProduct.category}</p>
                </div>
                <button onClick={() => setPreviewProduct(null)} className="p-1 rounded-md hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-2 gap-4 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Selling Price</p>
                  <p className="font-display font-bold text-lg text-foreground">₹{previewProduct.sellingPrice}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Stock</p>
                  <p className="font-display font-bold text-lg text-foreground">{previewProduct.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Average Rating</p>
                  <p className="font-display font-bold text-lg text-foreground inline-flex items-center gap-1">
                    <Star className="w-5 h-5 fill-secondary text-secondary" />
                    {(previewProduct.avgRating ?? 0).toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-display font-bold text-lg text-foreground">
                    {previewProduct.active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>

              {/* Reviews scrollable section */}
              <div className="flex-1 overflow-y-auto p-6">
                <h4 className="font-display font-semibold text-foreground mb-3">
                  Customer Ratings &amp; Reviews
                </h4>
                {/* TODO: API INTEGRATION -> GET /api/admin/products/{id}/ratings => { reviews[] } */}
                <div className="space-y-3">
                  {sampleReviews.map((rev) => (
                    <div key={rev.id} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-foreground">{rev.user}</p>
                        <span className="text-xs text-muted-foreground">{rev.date}</span>
                      </div>
                      <div className="flex items-center gap-0.5 mb-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`w-3.5 h-3.5 ${
                              n <= rev.rating ? "fill-secondary text-secondary" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={!!confirmDeleteId}
          title="Delete this product?"
          message="The product will be removed from your catalog. This cannot be undone."
          confirmLabel="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      </main>
    </div>
  );
};

export default ProductManagement;

