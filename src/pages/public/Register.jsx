import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { X, Mail, Lock, UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // TODO: API INTEGRATION -> POST /api/auth/register { name, email, password } => { user, token }
      await register(name, email, password);
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err?.message || "Registration failed. Please try again.";
      if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("network")) {
        setError("Cannot reach backend. Check that the API is running.");
      } else {
        setError(msg);
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="bg-card rounded-xl shadow-modal w-full max-w-md mx-4 p-8 animate-fade-in relative">
        <Link to="/" className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted transition-colors text-foreground">
          <X className="w-5 h-5" />
        </Link>

        <h2 className="font-display font-bold text-2xl text-foreground mb-6">Create Account</h2>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
                placeholder="John Doe" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
                placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-body"
                placeholder="At least 8 characters" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Use at least 8 characters with a mix of letters and numbers.</p>
          </div>

          <button type="submit" disabled={loading}
            className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Log in →</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
