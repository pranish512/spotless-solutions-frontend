import { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Plus, Pencil, Trash2, X } from "lucide-react";

// TODO: API INTEGRATION -> GET /api/admin/user-types => { userTypes: [{ id, name, description }] }
const initialUserTypes = [
  { id: "1", name: "Customer", description: "Default end-customer placing orders." },
  { id: "2", name: "Store Manager", description: "Manages inventory and staff at a branch." },
  { id: "3", name: "Support Agent", description: "Handles customer queries and order issues." },
];

const UserTypeManagement = () => {
  const [types, setTypes] = useState(initialUserTypes);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: API INTEGRATION -> POST /api/admin/user-types { name, description } => { userType }
    setTypes((prev) => [...prev, { id: String(Date.now()), ...form }]);
    setForm({ name: "", description: "" });
    setShowModal(false);
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-muted/30">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-bold text-2xl text-foreground">User Type Management</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add User Type
          </button>
        </div>

        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">User Type Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Description</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{t.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{t.description}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* TODO: API INTEGRATION -> PUT /api/admin/user-types/{id} { name, description } => { userType } */}
                      <button className="p-2 rounded-md hover:bg-muted text-primary transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {/* TODO: API INTEGRATION -> DELETE /api/admin/user-types/{id} => { success } */}
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

        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <div className="bg-card rounded-xl shadow-modal w-full max-w-md p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-xl text-foreground">Create User Type</h3>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form className="space-y-4" onSubmit={handleSave}>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">User Type Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-11 rounded-lg border border-border text-foreground font-display font-bold text-sm hover:bg-muted transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity">
                    Save User Type
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserTypeManagement;
