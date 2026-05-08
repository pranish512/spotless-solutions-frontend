import { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ResponsiveModal from "@/components/ResponsiveModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import ToggleSwitch from "@/components/ToggleSwitch";
import UserForm, { buildEmptyUserForm } from "@/components/UserForm";
import { STAFF_USER_TYPE_NAMES, isCustomerType } from "@/lib/userTypes";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

// TODO: API INTEGRATION -> GET /api/admin/users?kind=staff => only non-customer users
const initialStaff = [
  { ...buildEmptyUserForm("Store Manager"), id: "1", name: "Ravi Kumar", email: "ravi@spotless.com", userType: "Store Manager", status: "Active", phone: "+91 90000 11111" },
  { ...buildEmptyUserForm("Inventory Clerk"), id: "2", name: "Priya Sharma", email: "priya@spotless.com", userType: "Inventory Clerk", status: "Active", phone: "+91 90000 22222" },
  { ...buildEmptyUserForm("Support Agent"), id: "3", name: "Mohit Singh", email: "mohit@spotless.com", userType: "Support Agent", status: "Inactive", phone: "+91 90000 33333" },
];

const StaffManagement = () => {
  const [staff, setStaff] = useState(initialStaff);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(buildEmptyUserForm(STAFF_USER_TYPE_NAMES[0]));
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Staff screen excludes customers — backend users only
  const visible = staff.filter((s) => !isCustomerType(s.userType));
  const filtered = visible.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditingId(null); setForm(buildEmptyUserForm(STAFF_USER_TYPE_NAMES[0])); setShowModal(true); };
  const openEdit = (s) => { setEditingId(s.id); setForm({ ...buildEmptyUserForm(s.userType), ...s }); setShowModal(true); };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      // TODO: API INTEGRATION -> PUT /api/admin/users/{id}
      setStaff((prev) => prev.map((s) => (s.id === editingId ? { ...s, ...form } : s)));
    } else {
      // TODO: API INTEGRATION -> POST /api/admin/users (kind=staff)
      setStaff((prev) => [...prev, { id: String(Date.now()), ...form }]);
    }
    setShowModal(false); setEditingId(null);
  };

  const toggleStatus = (id) => {
    // TODO: API INTEGRATION -> PATCH /api/admin/users/{id}/status
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" } : s)));
  };

  const handleDelete = () => {
    // TODO: API INTEGRATION -> DELETE /api/admin/users/{id}
    setStaff((prev) => prev.filter((s) => s.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/30 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <h2 className="font-display font-bold text-2xl text-foreground">Staff Management</h2>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Add Staff
          </button>
        </div>

        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search staff..."
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring font-body" />
        </div>

        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Email / Login ID</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Role / User Type</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{s.email}</td>
                    <td className="px-4 py-3 text-sm">{s.userType}</td>
                    <td className="px-4 py-3">
                      <ToggleSwitch checked={s.status === "Active"} onChange={() => toggleStatus(s.id)} labelOn="Active" labelOff="Inactive" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(s)} className="p-2 rounded-md hover:bg-muted text-primary"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setConfirmDeleteId(s.id)} className="p-2 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <ResponsiveModal
          open={showModal}
          onClose={() => setShowModal(false)}
          title={editingId ? "Edit Staff" : "Create Staff"}
          maxWidth="max-w-3xl"
        >
          <UserForm
            form={form}
            setForm={setForm}
            userTypeOptions={STAFF_USER_TYPE_NAMES}
            showStatus
            isEditing={!!editingId}
            onSubmit={handleSave}
            onCancel={() => setShowModal(false)}
          />
        </ResponsiveModal>

        <ConfirmDialog
          open={!!confirmDeleteId}
          title="Delete this staff member?"
          message="The account and its access permissions will be permanently removed."
          confirmLabel="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      </main>
    </div>
  );
};

export default StaffManagement;
