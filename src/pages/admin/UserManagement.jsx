import { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AccessControlMatrix from "@/components/AccessControlMatrix";
import ConfirmDialog from "@/components/ConfirmDialog";
import { buildDefaultPermissions } from "@/lib/screens";
import { Plus, Pencil, Trash2, Search, X, Upload } from "lucide-react";

// TODO: API INTEGRATION -> GET /api/admin/users?search=&userType=&branch= => { users: [...], totalPages }
const initialUsers = [
  {
    id: "1",
    name: "John Doe",
    dob: "1992-05-12",
    gender: "Male",
    phone: "+91 90000 11111",
    email: "john@example.com",
    address: "12 MG Road, Bengaluru",
    profilePhoto: "",
    userType: "Customer",
    description: "Regular online buyer.",
    branch: "Bengaluru",
  },
  {
    id: "2",
    name: "Admin User",
    dob: "1985-03-08",
    gender: "Female",
    phone: "+91 98888 22222",
    email: "admin@spotless.com",
    address: "HQ, Mumbai",
    profilePhoto: "",
    userType: "Store Manager",
    description: "Oversees Mumbai branch operations.",
    branch: "Mumbai",
  },
];

// TODO: API INTEGRATION -> GET /api/admin/user-types => userType dropdown source
const userTypeOptions = ["Customer", "Store Manager", "Support Agent", "Cashier"];
// TODO: API INTEGRATION -> GET /api/admin/branches => branch dropdown source
const branchOptions = ["Bengaluru", "Mumbai", "Delhi", "Chennai"];

const emptyForm = {
  name: "",
  dob: "",
  gender: "Male",
  phone: "",
  email: "",
  address: "",
  profilePhoto: "",
  userType: userTypeOptions[0],
  description: "",
  branch: branchOptions[0],
  permissions: buildDefaultPermissions(),
};

const UserManagement = () => {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const isEditing = !!editingId;

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || u.userType === filterType;
    const matchBranch = !filterBranch || u.branch === filterBranch;
    return matchSearch && matchType && matchBranch;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditingId(u.id);
    setForm({ ...emptyForm, ...u, permissions: u.permissions || buildDefaultPermissions() });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (isEditing) {
      // TODO: API INTEGRATION -> PUT /api/admin/users/{id} { ...form, permissions } => { user }
      setUsers((prev) => prev.map((u) => (u.id === editingId ? { ...u, ...form } : u)));
    } else {
      // TODO: API INTEGRATION -> POST /api/admin/users { ...form, permissions } => { user }
      setUsers((prev) => [...prev, { id: String(Date.now()), ...form }]);
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(false);
  };

  const handleDelete = () => {
    // TODO: API INTEGRATION -> DELETE /api/admin/users/{id} => { success }
    setUsers((prev) => prev.filter((u) => u.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: API INTEGRATION -> POST /api/admin/users/upload-photo (multipart) => { url }
    setForm((f) => ({ ...f, profilePhoto: URL.createObjectURL(file) }));
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-muted/30">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-bold text-2xl text-foreground">User Management</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring font-body"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-11 px-4 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring font-body"
          >
            <option value="">All User Types</option>
            {userTypeOptions.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="h-11 px-4 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring font-body"
          >
            <option value="">All Branches</option>
            {branchOptions.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>

        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Email</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Phone</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">User Type</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Branch</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{u.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{u.phone}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{u.userType}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{u.branch}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* TODO: API INTEGRATION -> PUT /api/admin/users/{id} { ...userData, permissions } => { user } */}
                        <button className="p-2 rounded-md hover:bg-muted text-primary transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        {/* TODO: API INTEGRATION -> DELETE /api/admin/users/{id} => { success } */}
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
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
            <div className="bg-card rounded-xl shadow-modal w-full max-w-3xl p-8 my-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-xl text-foreground">Create User</h3>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form className="space-y-5" onSubmit={handleSave}>
                {/* Profile Photo */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                    {form.profilePhoto ? (
                      <img src={form.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Profile Photo</label>
                    <input type="file" accept="image/*" onChange={handlePhoto} className="text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">DOB</label>
                    <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })}
                      className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Gender</label>
                    <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body">
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Phone Number *</label>
                    <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
                    <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Branch</label>
                    <select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}
                      className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body">
                      {branchOptions.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">User Type *</label>
                    <select value={form.userType} onChange={(e) => setForm({ ...form, userType: e.target.value })}
                      className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body">
                      {userTypeOptions.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Address</label>
                  <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body resize-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description (about user role and responsibilities)
                  </label>
                  <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body resize-none" />
                </div>

                {/* User Access Control Section */}
                <AccessControlMatrix
                  title="User Access Control"
                  value={form.permissions}
                  onChange={(p) => setForm({ ...form, permissions: p })}
                />

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 h-11 rounded-lg border border-border text-foreground font-display font-bold text-sm hover:bg-muted transition-colors">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity">
                    Save User
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

export default UserManagement;
