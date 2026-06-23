import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ResponsiveModal from "@/components/ResponsiveModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import ToggleSwitch from "@/components/ToggleSwitch";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { loadBranches, saveBranches } from "@/lib/branches";
import { adminMastersService } from "@/services/adminMastersService";

const emptyForm = { name: "", description: "", status: "Active" };

const BranchManagement = () => {
  const { can } = useAuth();
  const canWrite = can("branches", "write");
  const canDelete = can("branches", "delete");
  const [branches, setBranches] = useState(loadBranches());
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { saveBranches(branches); }, [branches]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // TODO: API INTEGRATION -> GET /api/admin/branches => [{ id, name, description, status }]
        const data = await adminMastersService.listBranches({ limit: 100 });
        setBranches(data.items);
      } catch (err) {
        setError(err.message || "Unable to load branches.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = branches.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (b) => { setEditingId(b.id); setForm({ name: b.name, description: b.description, status: b.status }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        // TODO: API INTEGRATION -> PUT /api/admin/branches/{id}
        const updated = await adminMastersService.updateBranch(editingId, form);
        setBranches((prev) => prev.map((b) => (b.id === editingId ? updated : b)));
      } else {
        // TODO: API INTEGRATION -> POST /api/admin/branches
        const created = await adminMastersService.createBranch(form);
        setBranches((prev) => [created, ...prev]);
      }
      setShowModal(false); setEditingId(null);
    } catch (err) {
      setError(err.message || "Unable to save branch.");
    }
  };

  const toggleStatus = async (id) => {
    // TODO: API INTEGRATION -> PATCH /api/admin/branches/{id}/status
    const current = branches.find((b) => b.id === id);
    if (!current) return;
    const nextStatus = current.status === "Active" ? "Inactive" : "Active";
    try {
      const updated = await adminMastersService.toggleBranch(id, nextStatus);
      setBranches((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err) {
      setError(err.message || "Unable to update branch status.");
    }
  };

  const handleDelete = async () => {
    // TODO: API INTEGRATION -> DELETE /api/admin/branches/{id}
    try {
      await adminMastersService.deleteBranch(confirmDeleteId);
      setBranches((prev) => prev.filter((b) => b.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err.message || "Unable to delete branch.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/30 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <h2 className="font-display font-bold text-2xl text-foreground">Branch Management</h2>
          {canWrite && (
            <button onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity self-start sm:self-auto">
              <Plus className="w-4 h-4" /> Add Branch
            </button>
          )}
        </div>

        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search branches..."
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring font-body" />
        </div>
        {error && <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}

        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Description</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading branches...</td></tr>
                ) : filtered.map((b) => (
                  <tr key={b.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium">{b.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{b.description}</td>
                    <td className="px-4 py-3">
                      <ToggleSwitch checked={b.status === "Active"} onChange={() => canWrite && toggleStatus(b.id)} labelOn="Active" labelOff="Inactive" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canWrite && <button onClick={() => openEdit(b)} className="p-2 rounded-md hover:bg-muted text-primary"><Pencil className="w-4 h-4" /></button>}
                        {canDelete && <button onClick={() => setConfirmDeleteId(b.id)} className="p-2 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No branches found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ResponsiveModal open={showModal} onClose={() => setShowModal(false)} title={editingId ? "Edit Branch" : "Create Branch"} maxWidth="max-w-md">
          <form id="branch-form" className="space-y-4" onSubmit={handleSave}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body">
                <option>Active</option><option>Inactive</option>
              </select>
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
          title="Delete this branch?"
          message="This branch will no longer be available in Staff and User forms."
          confirmLabel="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      </main>
    </div>
  );
};

export default BranchManagement;
