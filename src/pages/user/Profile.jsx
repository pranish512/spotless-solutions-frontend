import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Camera, Plus, Pencil, Trash2, Package, LifeBuoy, MapPin, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

const MAX_ADDRESSES = 4;

const emptyAddress = { id: "", label: "Home", line1: "", city: "", state: "", pincode: "", phone: "" };

const Profile = () => {
  const { user } = useAuth();

  // TODO: API INTEGRATION -> GET /api/user/profile => { name, email, phone, profilePicture, addresses[] }
  // TODO: API INTEGRATION -> PUT /api/user/profile { name, email, phone } => { updatedProfile }
  // TODO: API INTEGRATION -> POST /api/user/profile/picture (multipart) => { url }

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    profilePicture: "",
  });

  const [addresses, setAddresses] = useState([
    { id: "a1", label: "Home", line1: "12, MG Road", city: "Bengaluru", state: "KA", pincode: "560001", phone: "+91 98765 43210" },
  ]);

  const [showAddrModal, setShowAddrModal] = useState(false);
  const [addrForm, setAddrForm] = useState(emptyAddress);
  const fileRef = useRef(null);

  const handlePicture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfile((p) => ({ ...p, profilePicture: URL.createObjectURL(file) }));
  };

  const saveProfile = (e) => {
    e.preventDefault();
    // TODO: API INTEGRATION -> PUT /api/user/profile { ...profile } => { updatedProfile }
  };

  const openAddAddress = () => {
    if (addresses.length >= MAX_ADDRESSES) return;
    setAddrForm({ ...emptyAddress, id: "" });
    setShowAddrModal(true);
  };

  const openEditAddress = (addr) => {
    setAddrForm(addr);
    setShowAddrModal(true);
  };

  const saveAddress = (e) => {
    e.preventDefault();
    if (addrForm.id) {
      // TODO: API INTEGRATION -> PUT /api/user/addresses/{id} { ...addrForm } => { address }
      setAddresses((prev) => prev.map((a) => (a.id === addrForm.id ? addrForm : a)));
    } else {
      // TODO: API INTEGRATION -> POST /api/user/addresses { ...addrForm } => { address }
      setAddresses((prev) => [...prev, { ...addrForm, id: String(Date.now()) }]);
    }
    setShowAddrModal(false);
  };

  const deleteAddress = (id) => {
    // TODO: API INTEGRATION -> DELETE /api/user/addresses/{id} => { success }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h2 className="font-display font-bold text-2xl text-foreground mb-6">My Profile</h2>

        {/* Profile Card */}
        <section className="bg-card rounded-lg shadow-card p-6 mb-6">
          <div className="flex items-start gap-6 flex-wrap">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display font-bold text-2xl text-muted-foreground">
                    {profile.name?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePicture} className="hidden" />
            </div>

            <form onSubmit={saveProfile} className="flex-1 min-w-[260px] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                <input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
                <input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="px-6 h-11 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Address Management */}
        <section className="bg-card rounded-lg shadow-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> My Addresses
              <span className="text-sm font-normal text-muted-foreground">({addresses.length}/{MAX_ADDRESSES})</span>
            </h3>
            <button
              onClick={openAddAddress}
              disabled={addresses.length >= MAX_ADDRESSES}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" /> Add Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No addresses added yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((a) => (
                <div key={a.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-md bg-muted text-foreground mb-1">
                        {a.label}
                      </span>
                      <p className="text-sm text-foreground font-medium">{a.line1}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.city}, {a.state} - {a.pincode}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{a.phone}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => openEditAddress(a)} className="p-2 rounded-md hover:bg-muted text-primary transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteAddress(a.id)} className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* My Orders + Help Center */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/user/orders"
            className="bg-card rounded-lg shadow-card p-6 flex items-center gap-4 hover:shadow-modal transition-shadow"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground">My Orders</h3>
              <p className="text-sm text-muted-foreground">View your order history and track shipments</p>
            </div>
          </Link>

          <div className="bg-card rounded-lg shadow-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground">Help Center</h3>
              <p className="text-sm text-muted-foreground">support@spotlesssolutions.in</p>
              <p className="text-sm text-muted-foreground">+91 1800 123 4567 (9am – 7pm)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddrModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowAddrModal(false)}
        >
          <div
            className="bg-card rounded-xl shadow-modal w-full max-w-lg p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-foreground">
                {addrForm.id ? "Edit Address" : "Add Address"}
              </h3>
              <button onClick={() => setShowAddrModal(false)} className="p-1 rounded-md hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={saveAddress} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Label</label>
                  <select
                    value={addrForm.label}
                    onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
                  >
                    <option>Home</option>
                    <option>Work</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                  <input
                    required
                    value={addrForm.phone}
                    onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Address Line</label>
                <input
                  required
                  value={addrForm.line1}
                  onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">City</label>
                  <input
                    required
                    value={addrForm.city}
                    onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">State</label>
                  <input
                    required
                    value={addrForm.state}
                    onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Pincode</label>
                  <input
                    required
                    value={addrForm.pincode}
                    onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddrModal(false)}
                  className="flex-1 h-11 rounded-lg border border-border text-foreground font-display font-bold text-sm hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Profile;
