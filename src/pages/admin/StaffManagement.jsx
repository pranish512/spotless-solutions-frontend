import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ResponsiveModal from "@/components/ResponsiveModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import ToggleSwitch from "@/components/ToggleSwitch";
import UserForm, { buildEmptyUserForm } from "@/components/UserForm";
import { STAFF_USER_TYPE_NAMES, isCustomerType } from "@/lib/userTypes";
import { saveBranches } from "@/lib/branches";
import { useAuth } from "@/contexts/AuthContext";
import { adminMastersService } from "@/services/adminMastersService";
import { adminUsersService } from "@/services/adminUsersService";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

// TODO: API INTEGRATION -> GET /api/admin/users?kind=staff => only non-customer users
const initialStaff = [
  { ...buildEmptyUserForm("Store Manager"), id: "1", name: "Ravi Kumar", email: "ravi@spotless.com", userType: "Store Manager", status: "Active", phone: "+91 90000 11111" },
  { ...buildEmptyUserForm("Inventory Clerk"), id: "2", name: "Priya Sharma", email: "priya@spotless.com", userType: "Inventory Clerk", status: "Active", phone: "+91 90000 22222" },
  { ...buildEmptyUserForm("Support Agent"), id: "3", name: "Mohit Singh", email: "mohit@spotless.com", userType: "Support Agent", status: "Inactive", phone: "+91 90000 33333" },
];

const StaffManagement = () => {
  const { can } = useAuth();
  const canWrite = can("staff", "write");
  const canDelete = can("staff", "delete");
  const [staff, setStaff] = useState(initialStaff);
  const [userTypes, setUserTypes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [userTypeOptions, setUserTypeOptions] = useState(STAFF_USER_TYPE_NAMES);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(buildEmptyUserForm(STAFF_USER_TYPE_NAMES[0]));
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
        const activeBranches = branchData.items.filter((branch) => branch.status === "Active");
        const staffTypes = typeData.items.filter((type) => type.kind !== "customer" && type.status === "Active");
        const nextRefs = { userTypes: typeData.items, branches: branchData.items };

        setUserTypes(typeData.items);
        setBranches(branchData.items);
        setUserTypeOptions(staffTypes.length ? staffTypes.map((type) => type.name) : STAFF_USER_TYPE_NAMES);
        saveBranches(activeBranches.length ? activeBranches : branchData.items);

        // TODO: API INTEGRATION -> GET /api/admin/staff
        const data = await adminUsersService.listStaff({ limit: 100 }, nextRefs);
        setStaff(data.items);
      } catch (err) {
        setError(err.message || "Unable to load staff.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Staff screen excludes customers — backend users only
  const visible = staff.filter((s) => !isCustomerType(s.userType));
  const filtered = visible.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditingId(null); setForm(buildEmptyUserForm(userTypeOptions[0] || STAFF_USER_TYPE_NAMES[0])); setShowModal(true); };
  const openEdit = (s) => { setEditingId(s.id); setForm({ ...buildEmptyUserForm(s.userType), ...s, password: "" }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        // TODO: API INTEGRATION -> PUT /api/admin/staff/{id}
        const updated = await adminUsersService.updateStaff(editingId, form, refs);
        setStaff((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
      } else {
        // TODO: API INTEGRATION -> POST /api/admin/staff
        const created = await adminUsersService.createStaff(form, refs);
        setStaff((prev) => [created, ...prev]);
      }
      setShowModal(false); setEditingId(null);
    } catch (err) {
      setError(err.message || "Unable to save staff.");
    }
  };

  const toggleStatus = async (id) => {
    // TODO: API INTEGRATION -> PATCH /api/admin/staff/{id}/status
    if (!canWrite) return;
    const current = staff.find((s) => s.id === id);
    if (!current) return;
    const nextStatus = current.status === "Active" ? "Inactive" : "Active";
    try {
      const updated = await adminUsersService.toggleStaff(id, nextStatus, refs);
      setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err) {
      setError(err.message || "Unable to update staff status.");
    }
  };

  const handleDelete = async () => {
    // TODO: API INTEGRATION -> DELETE /api/admin/staff/{id}
    if (!canDelete) return;
    try {
      await adminUsersService.deleteStaff(confirmDeleteId);
      setStaff((prev) => prev.filter((s) => s.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err.message || "Unable to delete staff.");
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/30 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <h2 className="font-display font-bold text-2xl text-foreground">Staff Management</h2>
          {canWrite && (
            <button onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity self-start sm:self-auto">
              <Plus className="w-4 h-4" /> Add Staff
            </button>
          )}
        </div>
        {error && <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}

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
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading staff...</td></tr>
                ) : filtered.map((s) => (
                  <tr key={s.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{s.email}</td>
                    <td className="px-4 py-3 text-sm">{s.userType}</td>
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
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No staff found.</td></tr>
                )}
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
            userTypeOptions={userTypeOptions}
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
