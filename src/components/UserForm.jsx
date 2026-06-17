import { Upload } from "lucide-react";
import AccessControlMatrix from "@/components/AccessControlMatrix";
import { BRANCH_OPTIONS } from "@/lib/userTypes";
import { getActiveBranchNames } from "@/lib/branches";
import { buildDefaultPermissions } from "@/lib/screens";

/**
 * Unified User/Staff form. Same structure for both screens — User Type drives behavior.
 *
 * Props:
 *  - form: form state object
 *  - setForm: setter
 *  - userTypeOptions: string[] (Staff screen passes only non-customer types)
 *  - showStatus?: boolean
 *  - onSubmit, onCancel, isEditing
 */
export const buildEmptyUserForm = (defaultUserType = "Customer") => ({
  name: "",
  dob: "",
  gender: "Male",
  phone: "",
  email: "",
  address: "",
  profilePhoto: "",
  userType: defaultUserType,
  password: "",
  description: "",
  branch: BRANCH_OPTIONS[0],
  status: "Active",
  permissions: buildDefaultPermissions(),
});

const UserForm = ({ form, setForm, userTypeOptions, showStatus = true, onSubmit, onCancel, isEditing }) => {
  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: API INTEGRATION -> POST /api/admin/users/upload-photo (multipart) => { url }
    setForm((f) => ({ ...f, profilePhoto: URL.createObjectURL(file) }));
  };

  return (
    <form id="user-form" className="space-y-5" onSubmit={onSubmit}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
          {form.profilePhoto ? (
            <img src={form.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <Upload className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Profile Photo</label>
          <input type="file" accept="image/*" onChange={handlePhoto} className="text-sm max-w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Name *">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
        </Field>
        <Field label="DOB">
          <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Gender">
          <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={inputCls}>
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
        </Field>
        <Field label="Phone Number *">
          <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Email / Login ID *">
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
        </Field>
        <Field label={isEditing ? "Password" : "Password *"}>
          <input
            required={!isEditing}
            type="password"
            minLength={8}
            value={form.password || ""}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Branch *">
          <select required value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} className={inputCls}>
            {(getActiveBranchNames().length ? getActiveBranchNames() : BRANCH_OPTIONS).map((b) => <option key={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="User Type *">
          <select value={form.userType} onChange={(e) => setForm({ ...form, userType: e.target.value })} className={inputCls}>
            {userTypeOptions.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        {showStatus && (
          <Field label="Status *">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
              <option>Active</option><option>Inactive</option>
            </select>
          </Field>
        )}
      </div>

      <Field label="Address">
        <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={textareaCls} />
      </Field>

      <Field label="Description (about user role and responsibilities)">
        <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={textareaCls} />
      </Field>

      <AccessControlMatrix
        title="User Access Control"
        value={form.permissions}
        onChange={(p) => setForm({ ...form, permissions: p })}
      />

      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 h-11 rounded-lg border border-border text-foreground font-display font-bold text-sm hover:bg-muted transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity">
          {isEditing ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
};

const inputCls = "w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body";
const textareaCls = "w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body resize-none";

const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
    {children}
  </div>
);

export default UserForm;
