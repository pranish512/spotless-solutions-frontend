import { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Plus, Pencil, Trash2, X } from "lucide-react";

// TODO: API INTEGRATION -> GET /api/admin/tags => { tags: [{ id, name, icon }] }
const initialTags = [
  { id: "1", name: "Eco-Friendly", icon: "🌿" },
  { id: "2", name: "Best Seller", icon: "🔥" },
  { id: "3", name: "New Arrival", icon: "✨" },
  { id: "4", name: "On Sale", icon: "🏷️" },
];

const TagsManagement = () => {
  const [tags, setTags] = useState(initialTags);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", icon: "" });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const isEditing = !!editingId;

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", icon: "" });
    setShowModal(true);
  };

  const openEdit = (tag) => {
    setEditingId(tag.id);
    setForm({ name: tag.name, icon: tag.icon });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (isEditing) {
      // TODO: API INTEGRATION -> PUT /api/admin/tags/{id} { name, icon } => { tag }
      setTags((prev) => prev.map((t) => (t.id === editingId ? { ...t, ...form } : t)));
    } else {
      // TODO: API INTEGRATION -> POST /api/admin/tags { name, icon } => { tag }
      setTags((prev) => [...prev, { id: String(Date.now()), ...form }]);
    }
    setForm({ name: "", icon: "" });
    setEditingId(null);
    setShowModal(false);
  };

  const handleDelete = () => {
    // TODO: API INTEGRATION -> DELETE /api/admin/tags/{id} => { success }
    setTags((prev) => prev.filter((t) => t.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-muted/30">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-bold text-2xl text-foreground">Tags Management</h2>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Tag
          </button>
        </div>

        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Emoji / Icon</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Name</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((t) => (
                <tr key={t.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-2xl">{t.icon}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{t.name}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(t)}
                        className="p-2 rounded-md hover:bg-muted text-primary transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(t.id)}
                        className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
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
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <div className="bg-card rounded-xl shadow-modal w-full max-w-md p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-xl text-foreground">
                  {isEditing ? "Edit Tag" : "Create Tag"}
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
                  <label className="block text-sm font-medium text-foreground mb-1">Emoji / Icon *</label>
                  <input
                    required
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="🏷️"
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body text-xl"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-11 rounded-lg border border-border text-foreground font-display font-bold text-sm hover:bg-muted transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity">
                    {isEditing ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={!!confirmDeleteId}
          title="Delete tag?"
          message="This tag will be removed from all products it's currently applied to."
          confirmLabel="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      </main>
    </div>
  );
};

export default TagsManagement;
