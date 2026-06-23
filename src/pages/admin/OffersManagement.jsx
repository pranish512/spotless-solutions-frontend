import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ResponsiveModal from "@/components/ResponsiveModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import ToggleSwitch from "@/components/ToggleSwitch";
import { Plus, Pencil, Trash2, Megaphone } from "lucide-react";
import { offersService } from "@/lib/offers";

const emptyForm = { title: "", description: "", order: 1, enabled: true };

const OffersManagement = () => {
  const [offers, setOffers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const refresh = () => setOffers(offersService.list());
  useEffect(() => { refresh(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, order: offers.length + 1 });
    setShowModal(true);
  };
  const openEdit = (o) => {
    setEditingId(o.id);
    setForm({ title: o.title, description: o.description || "", order: o.order ?? 1, enabled: !!o.enabled });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const payload = { ...form, order: Number(form.order) || 1 };
    if (editingId) offersService.update(editingId, payload);
    else offersService.create(payload);
    setShowModal(false);
    setEditingId(null);
    refresh();
  };

  const toggle = (id) => { offersService.toggle(id); refresh(); };
  const handleDelete = () => { offersService.remove(confirmDeleteId); setConfirmDeleteId(null); refresh(); };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/30 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-primary" /> Offers
            </h2>
            <p className="text-sm text-muted-foreground">Manage the promotional banner shown at the top of the site.</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Add Offer
          </button>
        </div>

        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium w-16">Order</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Title</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Description</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((o) => (
                  <tr key={o.id} className="border-t border-border hover:bg-muted/50 align-top">
                    <td className="px-4 py-3 text-sm">{o.order}</td>
                    <td className="px-4 py-3 text-sm font-medium break-words max-w-xs">{o.title}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground break-words max-w-md">{o.description}</td>
                    <td className="px-4 py-3">
                      <ToggleSwitch checked={!!o.enabled} onChange={() => toggle(o.id)} labelOn="Enabled" labelOff="Disabled" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(o)} className="p-2 rounded-md hover:bg-muted text-primary"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setConfirmDeleteId(o.id)} className="p-2 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {offers.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No offers yet. Add one to display a top banner.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ResponsiveModal open={showModal} onClose={() => setShowModal(false)} title={editingId ? "Edit Offer" : "Create Offer"} maxWidth="max-w-lg">
          <form className="space-y-4" onSubmit={handleSave}>
            <div>
              <label className="block text-sm font-medium mb-1">Offer Title *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Offer Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body resize-y" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <input type="number" min={1} value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <ToggleSwitch checked={form.enabled} onChange={(v) => setForm({ ...form, enabled: v })} labelOn="Enabled" labelOff="Disabled" />
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)}
                className="flex-1 h-11 rounded-lg border border-border text-foreground font-display font-bold text-sm hover:bg-muted">Cancel</button>
              <button type="submit"
                className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90">
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </ResponsiveModal>

        <ConfirmDialog
          open={!!confirmDeleteId}
          title="Delete offer?"
          message="This offer will be removed from the top banner immediately."
          confirmLabel="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      </main>
    </div>
  );
};

export default OffersManagement;
