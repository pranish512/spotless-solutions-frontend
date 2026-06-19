import { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ImageUploadField from "@/components/ImageUploadField";
import { Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// TODO: API INTEGRATION -> GET /api/admin/profile => { name, email, profilePhoto }
const AdminProfile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "Admin",
    email: user?.email || "admin@spotless.com",
    profilePhoto: "",
    profilePhotoFile: null,
  });
  const [savedAt, setSavedAt] = useState(null);

  const handlePhoto = (file, dataUrl) => {
    // TODO: API INTEGRATION -> POST /api/admin/profile/upload-photo (multipart) => { url }
    setForm((f) => ({ ...f, profilePhoto: dataUrl || "", profilePhotoFile: file || null }));
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
          <div className="max-w-xs">
            <ImageUploadField
              label="Profile Picture"
              presetKey="profile"
              value={form.profilePhoto}
              onChange={handlePhoto}
              aspectClass="aspect-square"
            />
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
