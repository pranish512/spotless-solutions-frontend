import { useEffect, useRef, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ResponsiveModal from "@/components/ResponsiveModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import ToggleSwitch from "@/components/ToggleSwitch";
import RichTextEditor from "@/components/RichTextEditor";
import RichTextRenderer from "@/components/RichTextRenderer";
import ImageUploadField from "@/components/ImageUploadField";
import { Plus, Pencil, Trash2, Search, Upload, FileText, ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { loadServices, saveServices, makeServiceSlug } from "@/lib/services";
import { adminServicesService } from "@/services/adminServicesService";
import { fileToDataUrl } from "@/lib/imageValidation";

const MAX_BROCHURE_MB = 20;

const stripHtml = (html) => (html || "").replace(/<[^>]*>/g, "").trim();

const emptyForm = {
  name: "",
  description: "",
  image: "",
  imageFile: null,
  brochureUrl: "",
  brochureName: "",
  brochureFile: null,
  status: "Active",
};

const ServicesManagement = () => {
  const { can, isAdmin } = useAuth();
  const canWrite = isAdmin || can("services", "write");
  const canDelete = isAdmin || can("services", "delete");

  const [items, setItems] = useState(loadServices());
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const imgRef = useRef(null);
  const pdfRef = useRef(null);

  useEffect(() => { saveServices(items); }, [items]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // TODO: API INTEGRATION -> GET /api/admin/services => { items: [...] }
        const data = await adminServicesService.listServices({ limit: 100 });
        setItems(data.items);
      } catch (err) {
        // Soft-fail to local cache so UI stays usable in offline/dev.
        setError("");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = items.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setError(""); setShowModal(true); };
  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      description: s.description,
      image: s.image,
      imageFile: null,
      brochureUrl: s.brochureUrl,
      brochureName: s.brochureName,
      brochureFile: null,
      status: s.status,
    });
    setError("");
    setShowModal(true);
  };

  const handleBrochure = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") { setError("Brochure must be a PDF file."); return; }
    if (file.size > MAX_BROCHURE_MB * 1024 * 1024) { setError(`Brochure must be under ${MAX_BROCHURE_MB} MB.`); return; }
    const url = await fileToDataUrl(file);
    setForm((f) => ({ ...f, brochureUrl: url, brochureName: file.name, brochureFile: file }));
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Service name is required.");
    if (!stripHtml(form.description)) return setError("Description is required.");
    if (!form.image) return setError("Service image is required.");


    const slug = makeServiceSlug(form.name);
    try {
      if (editingId) {
        // TODO: API INTEGRATION -> PUT /api/admin/services/{id} (multipart)
        let updated;
        try { updated = await adminServicesService.updateService(editingId, form); } catch { updated = null; }
        const next = updated || { id: editingId, slug, ...form };
        setItems((prev) => prev.map((s) => (s.id === editingId ? { ...s, ...next } : s)));
      } else {
        // TODO: API INTEGRATION -> POST /api/admin/services (multipart)
        let created;
        try { created = await adminServicesService.createService(form); } catch { created = null; }
        const next = created || { id: `svc-${Date.now()}`, slug, ...form };
        setItems((prev) => [next, ...prev]);
      }
      setShowModal(false); setEditingId(null);
    } catch (err) {
      setError(err.message || "Unable to save service.");
    }
  };

  const toggleStatus = async (id) => {
    const current = items.find((s) => s.id === id);
    if (!current) return;
    const nextStatus = current.status === "Active" ? "Inactive" : "Active";
    try {
      // TODO: API INTEGRATION -> PATCH /api/admin/services/{id}/status
      try { await adminServicesService.toggleService(id, nextStatus); } catch {}
      setItems((prev) => prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s)));
    } catch (err) {
      setError(err.message || "Unable to update service status.");
    }
  };

  const handleDelete = async () => {
    try {
      // TODO: API INTEGRATION -> DELETE /api/admin/services/{id}
      try { await adminServicesService.deleteService(confirmDeleteId); } catch {}
      setItems((prev) => prev.filter((s) => s.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err.message || "Unable to delete service.");
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/30 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <h2 className="font-display font-bold text-2xl text-foreground">Services Management</h2>
          {canWrite && (
            <button onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity self-start sm:self-auto">
              <Plus className="w-4 h-4" /> Add Service
            </button>
          )}
        </div>

        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..."
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring font-body" />
        </div>
        {error && <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}

        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium">Image</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Description</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Brochure</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading services...</td></tr>
                ) : filtered.map((s) => (
                  <tr key={s.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-4 py-3">
                      {s.image ? (
                        <img src={s.image} alt={s.name} className="w-14 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-14 h-10 rounded bg-muted flex items-center justify-center text-muted-foreground"><ImageIcon className="w-4 h-4" /></div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-md truncate">{stripHtml(s.description)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {s.brochureName ? (
                        <span className="inline-flex items-center gap-1.5"><FileText className="w-4 h-4 text-primary" /> {s.brochureName}</span>
                      ) : <span className="text-muted-foreground/70">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <ToggleSwitch checked={s.status === "Active"} onChange={() => canWrite && toggleStatus(s.id)} labelOn="Active" labelOff="Inactive" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canWrite && <button onClick={() => openEdit(s)} className="p-2 rounded-md hover:bg-muted text-primary"><Pencil className="w-4 h-4" /></button>}
                        {canDelete && <button onClick={() => setConfirmDeleteId(s.id)} className="p-2 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No services found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ResponsiveModal open={showModal} onClose={() => setShowModal(false)} title={editingId ? "Edit Service" : "Create Service"} maxWidth="max-w-2xl">
          <form id="service-form" className="space-y-4" onSubmit={handleSave}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Service Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-foreground">Description *</label>
                <span className={`text-xs ${form.description.length > MAX_DESC ? "text-destructive" : "text-muted-foreground"}`}>
                  {form.description.length}/{MAX_DESC}
                </span>
              </div>
              <textarea required rows={5} maxLength={MAX_DESC} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Service Image *</label>
                <input ref={imgRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                  onChange={(e) => handleImage(e.target.files?.[0])} />
                <button type="button" onClick={() => imgRef.current?.click()}
                  className="w-full h-11 px-4 rounded-lg border border-dashed border-border bg-background hover:bg-muted/50 flex items-center justify-center gap-2 text-sm">
                  <Upload className="w-4 h-4" /> {form.image ? "Change image" : "Upload image"}
                </button>
                {form.image && <img src={form.image} alt="preview" className="mt-2 w-full h-32 object-cover rounded-lg border border-border" />}
                <p className="text-xs text-muted-foreground mt-1">PNG / JPG / WEBP · max {MAX_IMAGE_MB} MB</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Brochure (PDF)</label>
                <input ref={pdfRef} type="file" accept="application/pdf" className="hidden"
                  onChange={(e) => handleBrochure(e.target.files?.[0])} />
                <button type="button" onClick={() => pdfRef.current?.click()}
                  className="w-full h-11 px-4 rounded-lg border border-dashed border-border bg-background hover:bg-muted/50 flex items-center justify-center gap-2 text-sm">
                  <Upload className="w-4 h-4" /> {form.brochureName ? "Change brochure" : "Upload brochure"}
                </button>
                {form.brochureName && (
                  <div className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4 text-primary" /> {form.brochureName}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">PDF · max {MAX_BROCHURE_MB} MB</p>
              </div>
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
          title="Delete this service?"
          message="The service will be removed from the customer portal."
          confirmLabel="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      </main>
    </div>
  );
};

export default ServicesManagement;
