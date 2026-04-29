import { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Upload, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// TODO: API INTEGRATION -> GET /api/admin/profile => { name, email, profilePhoto }
const AdminProfile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "Admin",
    email: user?.email || "admin@spotless.com",
    profilePhoto: "",
  });
  const [savedAt, setSavedAt] = useState(null);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: API INTEGRATION -> POST /api/admin/profile/upload-photo (multipart) => { url }
    setForm((f) => ({ ...f, profilePhoto: URL.createObjectURL(file) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: API INTEGRATION -> PUT /api/admin/profile { name, email, profilePhoto } => { profile }
    setSavedAt(new Date().toLocaleTimeString());
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-muted/30">
        <h2 className="font-display font-bold text-2xl text-foreground mb-6">Admin Profile</h2>

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-xl shadow-card p-8 max-w-2xl space-y-6"
        >
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-full bg-muted overflow-hidden flex items-center justify-center">
              {form.profilePhoto ? (
                <img src={form.profilePhoto} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-7 h-7 text-muted-foreground" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Profile Picture
              </label>
              <input type="file" accept="image/*" onChange={handlePhoto} className="text-sm" />
            </div>
          </div>

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
            <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 h-11 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity"
            >
              <Save className="w-4 h-4" /> Update Profile
            </button>
            {savedAt && (
              <span className="text-sm text-accent">Saved at {savedAt}</span>
            )}
          </div>
        </form>
      </main>
    </div>
  );
};

export default AdminProfile;
