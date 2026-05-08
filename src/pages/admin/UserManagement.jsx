import { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ResponsiveModal from "@/components/ResponsiveModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import UserForm, { buildEmptyUserForm } from "@/components/UserForm";
import { ALL_USER_TYPE_NAMES } from "@/lib/userTypes";
import { getActiveBranchNames } from "@/lib/branches";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

// TODO: API INTEGRATION -> GET /api/admin/users => all users (customers + staff)
const initialUsers = [
  { ...buildEmptyUserForm("Customer"), id: "1", name: "John Doe", email: "john@example.com", phone: "+91 90000 11111", userType: "Customer", branch: "Bengaluru" },
  { ...buildEmptyUserForm("Store Manager"), id: "2", name: "Admin User", email: "admin@spotless.com", phone: "+91 98888 22222", userType: "Store Manager", branch: "Mumbai" },
];

const UserManagement = () => {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(buildEmptyUserForm());
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (!filterType || u.userType === filterType) && (!filterBranch || u.branch === filterBranch);
  });

  const openCreate = () => { setEditingId(null); setForm(buildEmptyUserForm()); setShowModal(true); };
  const openEdit = (u) => { setEditingId(u.id); setForm({ ...buildEmptyUserForm(u.userType), ...u }); setShowModal(true); };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      // TODO: API INTEGRATION -> PUT /api/admin/users/{id}
      setUsers((prev) => prev.map((u) => (u.id === editingId ? { ...u, ...form } : u)));
    } else {
      // TODO: API INTEGRATION -> POST /api/admin/users
      setUsers((prev) => [...prev, { id: String(Date.now()), ...form }]);
    }
    setShowModal(false); setEditingId(null);
  };

  const handleDelete = () => {
    // TODO: API INTEGRATION -> DELETE /api/admin/users/{id}
    setUsers((prev) => prev.filter((u) => u.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/30 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <h2 className="font-display font-bold text-2xl text-foreground">User Management</h2>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, phone..."
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring font-body" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="h-11 px-4 rounded-lg border border-border bg-card font-body">
            <option value="">All User Types</option>
            {ALL_USER_TYPE_NAMES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}
            className="h-11 px-4 rounded-lg border border-border bg-card font-body">
            <option value="">All Branches</option>
            {getActiveBranchNames().map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>

        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Phone</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">User Type</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Branch</th>
                  <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{u.phone}</td>
                    <td className="px-4 py-3 text-sm">{u.userType}</td>
                    <td className="px-4 py-3 text-sm">{u.branch}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(u)} className="p-2 rounded-md hover:bg-muted text-primary"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setConfirmDeleteId(u.id)} className="p-2 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
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
          title={editingId ? "Edit User" : "Create User"}
          maxWidth="max-w-3xl"
        >
          <UserForm
            form={form}
            setForm={setForm}
            userTypeOptions={ALL_USER_TYPE_NAMES}
            showStatus
            isEditing={!!editingId}
            onSubmit={handleSave}
            onCancel={() => setShowModal(false)}
          />
        </ResponsiveModal>

        <ConfirmDialog
          open={!!confirmDeleteId}
          title="Delete this user?"
          message="The user account and its access permissions will be permanently removed."
          confirmLabel="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      </main>
    </div>
  );
};

export default UserManagement;
