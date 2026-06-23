import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { reachUsService } from "@/services/reachUsService";
import { Save, CheckCircle2, MapPin, Mail, Phone, Clock } from "lucide-react";

const emptyForm = { email: "", phone: "", availability: "", location: "" };

/**
 * Reach Us — single-record contact editor (structured fields, edited in place).
 * Loads the existing record and updates the same row on save (no duplicates, no delete).
 */
const ReachUsEditor = () => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    reachUsService
      .getAdmin()
      .then((d) => { if (active) setForm(d); })
      .catch((err) => { if (active) setError(err?.message || "Unable to load Reach Us."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await reachUsService.update(form);
      setForm(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err?.message || "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const labelClass = "text-sm font-medium text-foreground mb-1 flex items-center gap-1.5";
  const inputClass = "w-full h-11 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body";

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/30 min-w-0">
        <div className="mb-6">
          <h2 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" /> Reach Us
          </h2>
          <p className="text-sm text-muted-foreground">Contact details shown on the storefront footer and the public Reach Us page.</p>
        </div>

        {error && <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm max-w-2xl">{error}</div>}

        <form onSubmit={handleSave} className="bg-card rounded-xl shadow-card p-4 sm:p-6 max-w-2xl space-y-5">
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}><Mail className="w-4 h-4 text-primary" /> Email Address</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="support@spotless.com" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}><Phone className="w-4 h-4 text-primary" /> Contact Number</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 (800) 555-CLEAN" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}><Clock className="w-4 h-4 text-primary" /> Availability</label>
                <input value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}
                  placeholder="Mon-Sat / 9 AM - 6 PM" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>
                  <MapPin className="w-4 h-4 text-primary" /> Head Office Location
                  <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea rows={3} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="123 Clean Street, City, State - 000000"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-body resize-none" />
                <p className="text-xs text-muted-foreground mt-1">Shown on the Reach Us page only — not in the footer.</p>
              </div>

              <div className="flex justify-end pt-1">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                  {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving…" : saved ? "Saved" : "Save Changes"}
                </button>
              </div>
            </>
          )}
        </form>
      </main>
    </div>
  );
};

export default ReachUsEditor;
