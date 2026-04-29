import { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ToggleSwitch from "@/components/ToggleSwitch";
import ConfirmDialog from "@/components/ConfirmDialog";
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
const categoryOptions = ["Cleaning Liquids", "Gloves", "Masks & Safety", "Car Cleaning", "Cleaning Tools", "Kitchen Care"];
// TODO: API INTEGRATION -> GET /api/admin/tags
const tagOptions = ["Eco-Friendly", "Best Seller", "New Arrival", "On Sale"];
const sizeOptions = ["S", "M", "L"];
const volumeOptions = ["500ml", "1L", "5L"];
const productTypes = ["Simple", "Variable size", "Bundle"];

const emptyForm = {
  name: "",
  description: "",
  highlights: "",
  tags: [],
  size: "M",
  volume: "500ml",
  sku: "",
  image: "",
  videoDemo: "",
  quantity: 0,
  category: categoryOptions[0],
  actualPrice: 0,
  sellingPrice: 0,
  discount: 0,
  barcode: "",
  manufacturer: "",
  hsn: "",
  productType: "Simple",
  enableRating: true,
  showRating: true,
};

const ProductManagement = () => {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const isEditing = !!editingId;

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm({
      ...emptyForm,
      name: product.name,
      category: product.category,
      sellingPrice: product.sellingPrice,
      quantity: product.quantity,
    });
    setShowModal(true);
  };

  const handleDelete = () => {
    // TODO: API INTEGRATION -> DELETE /api/admin/products/{id} => { success }
    setProducts((prev) => prev.filter((p) => p.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const toggleActive = (id) => {
    // TODO: API INTEGRATION -> PATCH /api/admin/products/{id}/status { active } => { product }
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  };

  const toggleTag = (tag) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: API INTEGRATION -> POST /api/admin/products/upload-image (multipart) => { url }
    setForm((f) => ({ ...f, image: URL.createObjectURL(file) }));
  };

  const handleVideo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: API INTEGRATION -> POST /api/admin/products/upload-video (multipart) => { url }
    setForm((f) => ({ ...f, videoDemo: URL.createObjectURL(file) }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (isEditing) {
      // TODO: API INTEGRATION -> PUT /api/admin/products/{id} { ...form } => { updatedProduct }
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                name: form.name,
                category: form.category,
                sellingPrice: Number(form.sellingPrice),
                quantity: Number(form.quantity),
              }
            : p
        )
      );
    } else {
      // TODO: API INTEGRATION -> POST /api/admin/products { ...form } => { product }
      setProducts((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          name: form.name,
          category: form.category,
          sellingPrice: Number(form.sellingPrice),
          quantity: Number(form.quantity),
          active: true,
        },
      ]);
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(false);
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-muted/30">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-bold text-2xl text-foreground">Product Management</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
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
                {filtered.map((product) => (
                  <tr key={product.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{product.name}</td>
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
                        onChange={() => toggleActive(product.id)}
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
                        <button className="p-2 rounded-md hover:bg-muted text-primary transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        {/* TODO: API INTEGRATION -> DELETE /api/admin/products/{id} => { success } */}
                        <button className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
            <div className="bg-card rounded-xl shadow-modal w-full max-w-4xl p-8 my-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-xl text-foreground">Add / Edit Product</h3>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form className="space-y-5" onSubmit={handleSave}>
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

                  {/* Variants / Units */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Size</label>
                    <select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}
                      className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body">
                      {sizeOptions.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Volume</label>
                    <select value={form.volume} onChange={(e) => setForm({ ...form, volume: e.target.value })}
                      className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body">
                      {volumeOptions.map((o) => <option key={o}>{o}</option>)}
                    </select>
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
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Product Image</label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                        {form.image ? (
                          <img src={form.image} alt="Product" className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <input type="file" accept="image/*" onChange={handleImage} className="text-sm" />
                    </div>
                  </div>
                  {/* Video Demo */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Video Demo (upload or link)</label>
                    <input type="file" accept="video/*" onChange={handleVideo} className="text-sm mb-1 block" />
                    <input
                      value={typeof form.videoDemo === "string" && form.videoDemo.startsWith("blob:") ? "" : form.videoDemo}
                      onChange={(e) => setForm({ ...form, videoDemo: e.target.value })}
                      placeholder="Or paste video URL"
                      className="w-full h-9 px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Available Quantity *</label>
                    <input required type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
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
                    <input required type="number" value={form.actualPrice} onChange={(e) => setForm({ ...form, actualPrice: e.target.value })}
                      className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Selling Price (₹) *</label>
                    <input required type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                      className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Discount (%)</label>
                    <input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })}
                      className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body" />
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

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 h-11 rounded-lg border border-border text-foreground font-display font-bold text-sm hover:bg-muted transition-colors">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity">
                    Save Product
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
      </main>
    </div>
  );
};

export default ProductManagement;

