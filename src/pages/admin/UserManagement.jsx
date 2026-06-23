import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ResponsiveModal from "@/components/ResponsiveModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import ToggleSwitch from "@/components/ToggleSwitch";
import UserForm, { buildEmptyUserForm } from "@/components/UserForm";
import { ALL_USER_TYPE_NAMES } from "@/lib/userTypes";
import { getActiveBranchNames, saveBranches } from "@/lib/branches";
import { useAuth } from "@/contexts/AuthContext";
import { adminMastersService } from "@/services/adminMastersService";
import { adminUsersService } from "@/services/adminUsersService";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

// TODO: API INTEGRATION -> GET /api/admin/users => all users (customers + staff)
const initialUsers = [
  { ...buildEmptyUserForm("Customer"), id: "1", name: "John Doe", email: "john@example.com", phone: "+91 90000 11111", userType: "Customer", branch: "Bengaluru" },
  { ...buildEmptyUserForm("Store Manager"), id: "2", name: "Admin User", email: "admin@spotless.com", phone: "+91 98888 22222", userType: "Store Manager", branch: "Mumbai" },
];

const UserManagement = () => {
  const { can } = useAuth();
  const canWrite = can("users", "write");
  const canDelete = can("users", "delete");
  const [users, setUsers] = useState(initialUsers);
  const [userTypes, setUserTypes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [userTypeOptions, setUserTypeOptions] = useState(ALL_USER_TYPE_NAMES);
  const [branchOptions, setBranchOptions] = useState(getActiveBranchNames());
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(buildEmptyUserForm());
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refs = { userTypes, branches };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [typeData, branchData] = await Promise.all([
          adminMastersService.listUserTypes({ limit: 100 }),
          adminMastersService.listBranches({ limit: 100 }),
        ]);
        const activeTypes = typeData.items.filter((type) => type.status === "Active");
        const activeBranches = branchData.items.filter((branch) => branch.status === "Active");
        const nextRefs = { userTypes: typeData.items, branches: branchData.items };

        setUserTypes(typeData.items);
        setBranches(branchData.items);
        setUserTypeOptions(activeTypes.length ? activeTypes.map((type) => type.name) : ALL_USER_TYPE_NAMES);
        setBranchOptions(activeBranches.length ? activeBranches.map((branch) => branch.name) : getActiveBranchNames());
        saveBranches(activeBranches.length ? activeBranches : branchData.items);

        // TODO: API INTEGRATION -> GET /api/admin/users
        const data = await adminUsersService.listUsers({ limit: 100 }, nextRefs);
        setUsers(data.items);
      } catch (err) {
        setError(err.message || "Unable to load users.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (!filterType || u.userType === filterType) && (!filterBranch || u.branch === filterBranch);
  });

  const openCreate = () => { setEditingId(null); setForm(buildEmptyUserForm(userTypeOptions[0] || "Customer")); setShowModal(true); };
  const openEdit = (u) => { setEditingId(u.id); setForm({ ...buildEmptyUserForm(u.userType), ...u, password: "" }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        // TODO: API INTEGRATION -> PUT /api/admin/users/{id}
        const updated = await adminUsersService.updateUser(editingId, form, refs);
        setUsers((prev) => prev.map((u) => (u.id === editingId ? updated : u)));
      } else {
        // TODO: API INTEGRATION -> POST /api/admin/users
        const created = await adminUsersService.createUser(form, refs);
        setUsers((prev) => [created, ...prev]);
      }
      setShowModal(false); setEditingId(null);
    } catch (err) {
      setError(err.message || "Unable to save user.");
    }
  };

  const toggleStatus = async (id) => {
    // TODO: API INTEGRATION -> PATCH /api/admin/users/{id}/status
    if (!canWrite) return;
    const current = users.find((u) => u.id === id);
    if (!current) return;
    const nextStatus = current.status === "Active" ? "Inactive" : "Active";
    try {
      const updated = await adminUsersService.toggleUser(id, nextStatus, refs);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      setError(err.message || "Unable to update user status.");
    }
  };

  const handleDelete = async () => {
    // TODO: API INTEGRATION -> DELETE /api/admin/users/{id}
    if (!canDelete) return;
    try {
      await adminUsersService.deleteUser(confirmDeleteId);
      setUsers((prev) => prev.filter((u) => u.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err.message || "Unable to delete user.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/30 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <h2 className="font-display font-bold text-2xl text-foreground">User Management</h2>
          {canWrite && (
            <button onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity self-start sm:self-auto">
              <Plus className="w-4 h-4" /> Add User
            </button>
          )}
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
            {userTypeOptions.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}
            className="h-11 px-4 rounded-lg border border-border bg-card font-body">
            <option value="">All Branches</option>
            {branchOptions.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
        {error && <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}

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
                  <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading users...</td></tr>
                ) : filtered.map((u) => (
                  <tr key={u.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{u.phone}</td>
                    <td className="px-4 py-3 text-sm">{u.userType}</td>
                    <td className="px-4 py-3 text-sm">{u.branch}</td>
                    <td className="px-4 py-3">
                      <ToggleSwitch checked={u.status === "Active"} onChange={() => canWrite && toggleStatus(u.id)} labelOn="Active" labelOff="Inactive" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canWrite && <button onClick={() => openEdit(u)} className="p-2 rounded-md hover:bg-muted text-primary"><Pencil className="w-4 h-4" /></button>}
                        {canDelete && <button onClick={() => setConfirmDeleteId(u.id)} className="p-2 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">No users found.</td></tr>
                )}
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
            userTypeOptions={userTypeOptions}
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
