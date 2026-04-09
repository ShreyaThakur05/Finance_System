import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import api from "../api/client";

const links = [
  {
    to: "/",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    roles: ["viewer", "analyst", "admin"],
  },
  {
    to: "/transactions",
    label: "Transactions",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
      </svg>
    ),
    roles: ["viewer", "analyst", "admin"],
  },
  {
    to: "/analytics",
    label: "Analytics",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    roles: ["analyst", "admin"],
    restricted: true,
  },
];

const navCls = ({ isActive }) =>
  `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
    isActive
      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
  }`;

export default function Sidebar() {
  const { hasRole, user } = useAuth();

  const { data: summary } = useQuery({
    queryKey: ["summary"],
    queryFn: () => api.get("/api/v1/analytics/summary").then((r) => r.data),
  });

  const fmt = (v) => (v !== undefined ? `₹${Number(v).toLocaleString("en-IN")}` : "N/A");

  const getRoleColor = (role) => {
    const c = {
      admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      analyst: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      viewer: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    };
    return c[role] || c.viewer;
  };

  const mobileLinks = links.filter((l) => l.roles.some((r) => hasRole(r)));

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-screen shrink-0">
        <div className="flex flex-col h-full p-5 gap-6">

          {/* Navigation */}
          <nav className="space-y-1">
            {links.map((l) => {
              const accessible = l.roles.some((r) => hasRole(r));

              if (!accessible && l.restricted) {
                return (
                  <div
                    key={l.to}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 dark:text-slate-600 cursor-not-allowed select-none"
                  >
                    <span className="opacity-40">{l.icon}</span>
                    <span>{l.label}</span>
                    <svg className="w-4 h-4 ml-auto opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                );
              }

              if (!accessible) return null;

              return (
                <NavLink key={l.to} to={l.to} end={l.to === "/"} className={navCls}>
                  {l.icon}
                  <span>{l.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Financial Summary — real data */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Overview
            </h3>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">Total Income</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {fmt(summary?.total_income)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">Total Expenses</span>
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {fmt(summary?.total_expenses)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Net Balance</span>
                <span className={`text-sm font-bold ${Number(summary?.net_balance) >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}`}>
                  {fmt(summary?.net_balance)}
                </span>
              </div>
            </div>
          </div>

          {/* User card at bottom */}
          <div className="mt-auto p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {user?.email?.split("@")[0] || "User"}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getRoleColor(user?.role)}`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800">
        <div className="flex justify-around py-2">
          {mobileLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-5 py-2 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? "bg-blue-100 dark:bg-blue-900/30" : ""}`}>
                    {l.icon}
                  </div>
                  <span>{l.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
