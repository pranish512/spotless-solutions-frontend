import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ResponsiveModal from "@/components/ResponsiveModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import ToggleSwitch from "@/components/ToggleSwitch";
import { Plus, Pencil, Trash2, Search, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { adminMastersService } from "@/services/adminMastersService";

const NAVBAR_LIMIT = 3;
const emptyForm = { name: "", icon: "", status: "Active", showInNavbar: false };

const TagsManagement = () => {
  const { can } = useAuth();
  const canWrite = can("tags", "write");
  const canDelete = can("tags", "delete");
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await adminMastersService.listTags({ limit: 100 });
        setTags(data.items);
      } catch (err) {
        setError(err.message || "Unable to load tags.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = tags.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
  const navbarCount = tags.filter((t) => t.showInNavbar).length;
  const navbarFull = navbarCount >= NAVBAR_LIMIT;

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setError(""); setShowModal(true); };
  const openEdit = (t) => {
    setEditingId(t.id);
    setForm({ name: t.name, icon: t.icon, status: t.status || "Active", showInNavbar: !!t.showInNavbar });
    setError("");
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        const updated = await adminMastersService.updateTag(editingId, form);
        setTags((prev) => prev.map((t) => (t.id === editingId ? updated : t)));
      } else {
        const created = await adminMastersService.createTag(form);
        setTags((prev) => [created, ...prev]);
      }
      setShowModal(false); setEditingId(null);
    } catch (err) {
      setError(err.message || "Unable to save tag.");
    }
  };

  const toggleStatus = async (id) => {
    if (!canWrite) return;
    const current = tags.find((t) => t.id === id);
    if (!current) return;
    const nextStatus = current.status === "Active" ? "Inactive" : "Active";
    try {
      const updated = await adminMastersService.toggleTag(id, nextStatus);
      setTags((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      setError(err.message || "Unable to update tag status.");
    }
  };

  const toggleNavbar = async (tag) => {
    if (!canWrite) return;
    setError("");
    // Block turning on a 4th client-side with a clear message (backend also enforces).
    if (!tag.showInNavbar && navbarFull) {
      setError(`Only ${NAVBAR_LIMIT} tags can appear in the navbar. Turn one off first.`);
      return;
    }
    try {
      const updated = await adminMastersService.toggleTagNavbar(tag.id, !tag.showInNavbar);
      setTags((prev) => prev.map((t) => (t.id === tag.id ? updated : t)));
    } catch (err) {
      setError(err.message || "Unable to update navbar visibility.");
    }
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    try {
      await adminMastersService.deleteTag(confirmDeleteId);
      setTags((prev) => prev.filter((t) => t.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err.message || "Unable to delete tag.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/30 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <h2 className="font-display font-bold text-2xl text-foreground">Tags Management</h2>
          {canWrite && (
            <button onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity self-start sm:self-auto">
              <Plus className="w-4 h-4" /> Add Tag
            </button>
          )}
        </div>

        {/* Navbar capacity note */}
        <div className={`flex items-start gap-2 mb-4 p-3 rounded-lg text-sm ${navbarFull ? "bg-secondary/20 text-foreground" : "bg-primary/10 text-foreground"}`}>
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p>
            Up to <strong>{NAVBAR_LIMIT} tags</strong> can appear in the customer navbar &amp; footer — alongside the static
            “All Products” link. <strong>{navbarCount}/{NAVBAR_LIMIT}</strong> selected.
            {navbarFull && " Turn one off to feature a different tag."}
          </p>
        </div>

        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tags..."
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring font-body" />
        </div>
        {error && <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}

        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium">Icon</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Show in Navbar</th>
                  <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading tags...</td></tr>
                ) : filtered.map((t) => (
                  <tr key={t.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-4 py-3 text-2xl">{t.icon}</td>
                    <td className="px-4 py-3 text-sm font-medium">{t.name}</td>
                    <td className="px-4 py-3">
                      <ToggleSwitch checked={t.status === "Active"} onChange={() => canWrite && toggleStatus(t.id)} labelOn="Active" labelOff="Inactive" />
                    </td>
                    <td className="px-4 py-3">
                      <ToggleSwitch checked={!!t.showInNavbar} onChange={() => toggleNavbar(t)} labelOn="Shown" labelOff="Hidden" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canWrite && <button onClick={() => openEdit(t)} className="p-2 rounded-md hover:bg-muted text-primary"><Pencil className="w-4 h-4" /></button>}
                        {canDelete && <button onClick={() => setConfirmDeleteId(t.id)} className="p-2 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No tags found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ResponsiveModal open={showModal} onClose={() => setShowModal(false)} title={editingId ? "Edit Tag" : "Create Tag"} maxWidth="max-w-md">
          <form className="space-y-4" onSubmit={handleSave}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Emoji / Icon *</label>
              <input required value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🏷️"
                className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body text-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body">
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
            <div className="rounded-lg border border-border p-3">
              <label className="flex items-center gap-2.5 text-sm font-medium text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.showInNavbar}
                  onChange={(e) => setForm({ ...form, showInNavbar: e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
                Show in customer navbar
              </label>
              <p className="text-xs text-muted-foreground mt-1.5">
                Active + shown tags appear in the storefront navbar &amp; footer (max {NAVBAR_LIMIT}).
                {!form.showInNavbar && navbarFull && !editingId && (
                  <span className="text-destructive"> Limit reached — turn one off first.</span>
                )}
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)}
                className="flex-1 h-11 rounded-lg border border-border text-foreground font-display font-bold text-sm hover:bg-muted transition-colors">Cancel</button>
              <button type="submit"
                className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity">
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </ResponsiveModal>

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
