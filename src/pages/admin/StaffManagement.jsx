import { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AccessControlMatrix from "@/components/AccessControlMatrix";
import ToggleSwitch from "@/components/ToggleSwitch";
import { buildDefaultPermissions } from "@/lib/screens";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";

// TODO: API INTEGRATION -> GET /api/admin/staff?search= => { staff: [{ id, name, email, role, status, permissions }] }
const initialStaff = [
  { id: "1", name: "Ravi Kumar", email: "ravi@spotless.com", role: "Store Manager", status: "Active" },
  { id: "2", name: "Priya Sharma", email: "priya@spotless.com", role: "Inventory Clerk", status: "Active" },
  { id: "3", name: "Mohit Singh", email: "mohit@spotless.com", role: "Support Agent", status: "Inactive" },
];

// TODO: API INTEGRATION -> GET /api/admin/user-types => { userTypes: [{ id, name }] } (drives Role dropdown)
const roleOptions = ["Store Manager", "Inventory Clerk", "Support Agent", "Cashier"];

const StaffManagement = () => {
  const [staff, setStaff] = useState(initialStaff);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: roleOptions[0],
    status: "Active",
    permissions: buildDefaultPermissions(),
  });

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () =>
    setForm({
      name: "",
      email: "",
      role: roleOptions[0],
      status: "Active",
      permissions: buildDefaultPermissions(),
    });

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: API INTEGRATION -> POST /api/admin/staff { name, email, role, status, permissions } => { staff }
    setStaff((prev) => [...prev, { id: String(Date.now()), ...form }]);
    setShowModal(false);
    resetForm();
  };

  const toggleStatus = (id) => {
    // TODO: API INTEGRATION -> PATCH /api/admin/staff/{id}/status { status } => { staff }
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" } : s))
    );
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-muted/30">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-bold text-2xl text-foreground">Staff Management</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Staff
          </button>
        </div>

        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff..."
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
          />
        </div>

        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Email / Login ID</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Role / User Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Status</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{s.email}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{s.role}</td>
                  <td className="px-4 py-3">
                    <ToggleSwitch
                      checked={s.status === "Active"}
                      onChange={() => toggleStatus(s.id)}
                      labelOn="Active"
                      labelOff="Inactive"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* TODO: API INTEGRATION -> PUT /api/admin/staff/{id} { ...staffData, permissions } => { staff } */}
                      <button className="p-2 rounded-md hover:bg-muted text-primary transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {/* TODO: API INTEGRATION -> DELETE /api/admin/staff/{id} => { success } */}
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
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
            <div
              className="bg-card rounded-xl shadow-modal w-full max-w-3xl p-8 my-8 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-xl text-foreground">Create Staff</h3>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form className="space-y-5" onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-foreground mb-1">Email / Login ID *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Role / User Type *</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
                    >
                      {roleOptions.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Status *</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>

                <AccessControlMatrix
                  value={form.permissions}
                  onChange={(p) => setForm({ ...form, permissions: p })}
                />

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
                    Save Staff
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

export default StaffManagement;
