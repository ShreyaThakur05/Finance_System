import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../api/client";
import toast from "react-hot-toast";
import ThemeToggle from "../components/ThemeToggle";

const ROLES = [
  {
    value: "viewer",
    label: "Viewer",
    desc: "Read-only access to transactions and summaries",
    color: "border-emerald-300 dark:border-emerald-700",
    active: "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
    dot: "bg-emerald-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    value: "analyst",
    label: "Financial Analyst",
    desc: "Full analytics, charts, CSV export and detailed insights",
    color: "border-blue-300 dark:border-blue-700",
    active: "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
    dot: "bg-blue-500",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function Register() {
  const { login, token } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("viewer");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (token) nav("/", { replace: true }); }, [token, nav]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/v1/auth/register", { name: form.name, email: form.email, password: form.password, role });
      await login(form.email, form.password);
      toast.success("Account created successfully");
      nav("/", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find((r) => r.value === role);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 bg-grid flex items-center justify-center p-4">
      <div className="absolute top-5 right-5"><ThemeToggle /></div>

      <div className="w-full max-w-lg animate-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">FinanceTracker</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Step {step} of 2 — {step === 1 ? "Choose your role" : "Fill in your details"}
          </p>
          {/* Progress */}
          <div className="flex gap-2 justify-center mt-4">
            <div className={`h-1.5 w-16 rounded-full transition-colors ${step >= 1 ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}`} />
            <div className={`h-1.5 w-16 rounded-full transition-colors ${step >= 2 ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}`} />
          </div>
        </div>

        <div className="card p-7 shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60">
          {step === 1 ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Select the role that best describes how you will use the system. You can ask an admin to change this later.
              </p>
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    role === r.value ? r.active : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${r.dot}`}>
                    {r.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-white">{r.label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{r.desc}</div>
                  </div>
                  {role === r.value && (
                    <svg className="w-5 h-5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
              <button onClick={() => setStep(2)} className="btn-primary w-full mt-2">
                Continue as {selectedRole?.label}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${selectedRole?.dot}`}>
                  {selectedRole?.icon}
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Registering as</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{selectedRole?.label}</div>
                </div>
                <button type="button" onClick={() => setStep(1)} className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  Change
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Full Name</label>
                <input type="text" required value={form.name} onChange={set("name")} className="input" placeholder="Your full name" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Email</label>
                <input type="email" required value={form.email} onChange={set("email")} className="input" placeholder="you@example.com" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      required value={form.password} onChange={set("password")}
                      className="input pr-9" placeholder="Min 6 chars"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPw ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Confirm</label>
                  <input type="password" required value={form.confirm} onChange={set("confirm")} className="input" placeholder="Repeat password" />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1">Back</button>
                <button type="submit" disabled={loading || !form.password || form.password !== form.confirm} className="btn-primary flex-1">
                  {loading
                    ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creating...</>
                    : "Create Account"
                  }
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
