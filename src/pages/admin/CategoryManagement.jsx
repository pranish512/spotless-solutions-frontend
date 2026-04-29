import { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Plus, Pencil, Trash2, X } from "lucide-react";

// TODO: API INTEGRATION -> GET /api/admin/categories => { categories: [{ id, name, slug, productCount }] }
const initialCategories = [
  { id: "1", name: "Cleaning Liquids", slug: "liquids", productCount: 45 },
  { id: "2", name: "Gloves", slug: "gloves", productCount: 23 },
  { id: "3", name: "Masks & Safety", slug: "masks", productCount: 18 },
  { id: "4", name: "Car Cleaning", slug: "car-kits", productCount: 31 },
  { id: "5", name: "Cleaning Tools", slug: "tools", productCount: 56 },
  { id: "6", name: "Kitchen Care", slug: "kitchen", productCount: 29 },
];

const emptyForm = { name: "", slug: "" };

const CategoryManagement = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const isEditing = !!editingId;

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (isEditing) {
      // TODO: API INTEGRATION -> PUT /api/admin/categories/{id} { name, slug } => { category }
      setCategories((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, ...form } : c))
      );
    } else {
      // TODO: API INTEGRATION -> POST /api/admin/categories { name, slug } => { category }
      setCategories((prev) => [...prev, { id: String(Date.now()), ...form, productCount: 0 }]);
    }
    setShowModal(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = () => {
    // TODO: API INTEGRATION -> DELETE /api/admin/categories/{id} => { success }
    setCategories((prev) => prev.filter((c) => c.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-muted/30">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-bold text-2xl text-foreground">Category Management</h2>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Slug</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Products</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{cat.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{cat.slug}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{cat.productCount}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-2 rounded-md hover:bg-muted text-primary transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(cat.id)}
                        className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-card rounded-xl shadow-modal w-full max-w-md p-6 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-xl text-foreground">
                  {isEditing ? "Edit Category" : "Create Category"}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form className="space-y-4" onSubmit={handleSave}>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Slug *</label>
                  <input
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 h-11 rounded-lg border border-border text-foreground font-display font-bold text-sm hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    {isEditing ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={!!confirmDeleteId}
          title="Delete category?"
          message="This will permanently remove the category. Products under it may need to be re-assigned."
          confirmLabel="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      </main>
    </div>
  );
};

export default CategoryManagement;
