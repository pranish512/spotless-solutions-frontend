import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Camera, Plus, Pencil, Trash2, Package, LifeBuoy, MapPin, X, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { validateImage, fileToDataUrl, formatGuideline, IMAGE_PRESETS } from "@/lib/imageValidation";
import { addressService } from "@/services/addressService";

const MAX_ADDRESSES = 4;

const emptyAddress = {
  id: "",
  label: "Home",
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  phone: "",
  isDefault: false,
};

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

  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressError, setAddressError] = useState("");
  const [addressSaving, setAddressSaving] = useState(false);

  const [showAddrModal, setShowAddrModal] = useState(false);
  const [addrForm, setAddrForm] = useState(emptyAddress);
  const [pictureError, setPictureError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setAddressLoading(true);
      setAddressError("");
      try {
        const data = await addressService.listAddresses({ limit: 50 });
        if (active) setAddresses(data.items);
      } catch (err) {
        if (active) setAddressError(err?.message || "Unable to load addresses");
      } finally {
        if (active) setAddressLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handlePicture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPictureError("");
    const result = await validateImage(file, IMAGE_PRESETS.profile);
    if (!result.ok) {
      setPictureError(result.error);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    // TODO: API INTEGRATION -> POST /api/user/profile/picture (multipart) => { url }
    setProfile((p) => ({ ...p, profilePicture: dataUrl }));
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

  const saveAddress = async (e) => {
    e.preventDefault();
    if (addressSaving) return;
    setAddressSaving(true);
    setAddressError("");
    try {
      if (addrForm.id) {
        const updated = await addressService.updateAddress(addrForm.id, addrForm);
        setAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      } else {
        const created = await addressService.createAddress(addrForm);
        setAddresses((prev) => [created, ...prev]);
      }
      setShowAddrModal(false);
    } catch (err) {
      setAddressError(err?.message || "Unable to save address");
    } finally {
      setAddressSaving(false);
    }
  };

  const deleteAddress = async (id) => {
    setAddressError("");
    try {
      await addressService.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setAddressError(err?.message || "Unable to delete address");
    }
  };

  const setDefault = async (id) => {
    setAddressError("");
    try {
      await addressService.setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
    } catch (err) {
      setAddressError(err?.message || "Unable to set default address");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h2 className="font-display font-bold text-2xl text-foreground mb-6">My Profile</h2>

        {/* Profile Card */}
        <section className="bg-card rounded-lg shadow-card p-6 mb-6">
          <div className="flex items-start gap-6 flex-wrap">
            <div className="flex flex-col items-center">
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
                  aria-label="Change profile picture"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePicture}
                  className="hidden"
                />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground text-center max-w-[160px] leading-tight">
                {formatGuideline(IMAGE_PRESETS.profile)}
              </p>
              {pictureError && (
                <p className="mt-1 text-[11px] text-destructive text-center max-w-[160px] leading-tight">{pictureError}</p>
              )}
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

          {addressError && (
            <div className="mb-3 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{addressError}</div>
          )}

          {addressLoading ? (
            <p className="text-sm text-muted-foreground">Loading addresses…</p>
          ) : addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No addresses added yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((a) => (
                <div key={a.id} className={`border rounded-lg p-4 ${a.isDefault ? "border-primary bg-primary/5" : "border-border"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-md bg-muted text-foreground">
                          {a.label}
                        </span>
                        {a.isDefault && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md bg-primary/10 text-primary">
                            <Star className="w-3 h-3" /> Default
                          </span>
                        )}
                      </div>
                      {a.fullName && <p className="text-sm text-foreground font-medium">{a.fullName}</p>}
                      <p className="text-sm text-foreground">{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.city}, {a.state} - {a.pincode}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{a.phone}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {!a.isDefault && (
                        <button
                          onClick={() => setDefault(a.id)}
                          className="p-2 rounded-md hover:bg-muted text-foreground transition-colors"
                          title="Set as default"
                          aria-label="Set as default"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => openEditAddress(a)} className="p-2 rounded-md hover:bg-muted text-primary transition-colors" aria-label="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteAddress(a.id)} className="p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors" aria-label="Delete">
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
                <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
                <input
                  required
                  value={addrForm.fullName}
                  onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                  placeholder="Recipient's name"
                  className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Address Line 1 *</label>
                <input
                  required
                  value={addrForm.line1}
                  onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })}
                  placeholder="House / flat number, street"
                  className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Address Line 2</label>
                <input
                  value={addrForm.line2 || ""}
                  onChange={(e) => setAddrForm({ ...addrForm, line2: e.target.value })}
                  placeholder="Apartment, landmark (optional)"
                  className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">City *</label>
                  <input
                    required
                    value={addrForm.city}
                    onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">State *</label>
                  <input
                    required
                    value={addrForm.state}
                    onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Pincode *</label>
                  <input
                    required
                    inputMode="numeric"
                    pattern="[0-9]{5,6}"
                    value={addrForm.pincode}
                    onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={!!addrForm.isDefault}
                  onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                  className="w-4 h-4"
                />
                Set as default address
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddrModal(false)}
                  disabled={addressSaving}
                  className="flex-1 h-11 rounded-lg border border-border text-foreground font-display font-bold text-sm hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSaving}
                  className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addressSaving ? "Saving…" : "Save Address"}
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
