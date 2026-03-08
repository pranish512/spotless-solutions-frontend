import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  // TODO: API INTEGRATION -> GET /api/user/profile => { name, email, phone, address }
  // TODO: API INTEGRATION -> PUT /api/user/profile { name, phone, address } => { updatedProfile }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <h2 className="font-display font-bold text-2xl text-foreground mb-6">My Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name</label>
            <input defaultValue={user?.name || ""} className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input defaultValue={user?.email || ""} disabled className="w-full h-11 px-4 rounded-lg border border-border bg-muted text-muted-foreground font-body" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
            <input placeholder="+91 XXXXX XXXXX" className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body" />
          </div>
          <button className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity">
            Save Changes
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
