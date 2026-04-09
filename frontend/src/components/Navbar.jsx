import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import ThemeToggle from "./ThemeToggle";
import toast from "react-hot-toast";

const ROLE_STYLES = {
  admin:   { badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",   dot: "bg-red-500" },
  analyst: { badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", dot: "bg-blue-500" },
  viewer:  { badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", dot: "bg-emerald-500" },
};

const PAGE_TITLES = { "/": "Dashboard", "/transactions": "Transactions", "/analytics": "Analytics" };

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const rs = ROLE_STYLES[user?.role] || ROLE_STYLES.viewer;
  const title = PAGE_TITLES[location.pathname] || "FinanceTracker";

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    toast.success("Signed out successfully");
  };

  return (
    <>
      <nav className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-5 sticky top-0 z-30">
        {/* Left */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm shadow-blue-600/30">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 dark:text-white hidden sm:block">FinanceTracker</span>
          </Link>
          <div className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-slate-700" />
          <span className="hidden sm:block text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* User button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${rs.dot}`} />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-900 dark:text-white leading-none">
                {user?.email?.split("@")[0] || "User"}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 capitalize leading-none mt-0.5">
                {user?.role}
              </div>
            </div>
            <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Dropdown */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-4 top-16 z-50 w-60 card shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60 py-1 animate-in-fast">
            {/* User info */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {user?.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {user?.email?.split("@")[0] || "User"}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
                  <span className={`badge mt-1 ${rs.badge}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${rs.dot}`} />
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile */}
            <button
              onClick={() => { setProfileOpen(true); setMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile Settings
            </button>

            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

            {/* Sign out */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </>
      )}

      {/* Profile modal */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="card p-6 w-full max-w-sm shadow-2xl animate-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Profile Settings</h3>
              <button onClick={() => setProfileOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                {user?.email?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{user?.email?.split("@")[0]}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</div>
                <span className={`badge mt-1 ${rs.badge}`}>{user?.role}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">First Name</label>
                  <input type="text" defaultValue={user?.email?.split("@")[0]} className="input" placeholder="First name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Last Name</label>
                  <input type="text" className="input" placeholder="Last name" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Phone Number</label>
                <input type="tel" className="input" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">City</label>
                <input type="text" className="input" placeholder="Mumbai" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">Organisation</label>
                <input type="text" className="input" placeholder="Company or team name" />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setProfileOpen(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={() => { toast.success("Settings saved"); setProfileOpen(false); }} className="btn-primary flex-1">Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
