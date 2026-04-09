import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import StatCard from "../components/StatCard";
import TransactionTable from "../components/TransactionTable";
import MonthlyBar from "../components/charts/MonthlyBar";
import CategoryPie from "../components/charts/CategoryPie";
import { useAuth } from "../hooks/useAuth";

const RANGES = [
  { key: "7d",  label: "7 days",   days: 7 },
  { key: "30d", label: "30 days",  days: 30 },
  { key: "90d", label: "90 days",  days: 90 },
  { key: "1y",  label: "1 year",   days: 365 },
];

function dateFrom(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

const fmt = (v) =>
  v !== undefined && v !== null
    ? `₹${Number(v).toLocaleString("en-IN")}`
    : "N/A";

const ROLE_STYLES = {
  admin:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  analyst: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  viewer:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const nav = useNavigate();
  const [range, setRange] = useState("30d");
  const canAnalyze = hasRole("analyst", "admin");

  const rangeDays = RANGES.find((r) => r.key === range)?.days || 30;
  const from = dateFrom(rangeDays);
  const today = new Date().toISOString().split("T")[0];

  const { data: summary, isLoading: sl } = useQuery({
    queryKey: ["summary", range],
    queryFn: () =>
      api.get("/api/v1/analytics/summary", { params: { date_from: from, date_to: today } }).then((r) => r.data),
  });

  const { data: recent, isLoading: rl } = useQuery({
    queryKey: ["recent"],
    queryFn: () => api.get("/api/v1/analytics/recent").then((r) => r.data),
  });

  const { data: monthly, isLoading: ml } = useQuery({
    queryKey: ["monthly"],
    queryFn: () => api.get("/api/v1/analytics/monthly").then((r) => r.data),
    enabled: canAnalyze,
  });

  const { data: cats, isLoading: cl } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/api/v1/analytics/categories").then((r) => r.data),
    enabled: canAnalyze,
  });

  const { data: insights } = useQuery({
    queryKey: ["insights"],
    queryFn: () => api.get("/api/v1/analytics/insights").then((r) => r.data),
    enabled: canAnalyze,
  });

  const netPositive = Number(summary?.net_balance) >= 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Page header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
              {user?.email?.split("@")[0] || "there"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Here is your financial snapshot for the selected period
            </p>
            <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${ROLE_STYLES[user?.role] || ROLE_STYLES.viewer}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
              {user?.role} access
            </span>
          </div>

          {/* Time range */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 self-start sm:self-auto">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                  range === r.key
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Income"
            value={fmt(summary?.total_income)}
            color="emerald"
            loading={sl}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>}
          />
          <StatCard
            label="Total Expenses"
            value={fmt(summary?.total_expenses)}
            color="red"
            loading={sl}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>}
          />
          <StatCard
            label="Net Balance"
            value={fmt(summary?.net_balance)}
            color={netPositive ? "blue" : "red"}
            loading={sl}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>}
          />
          <StatCard
            label="Transactions"
            value={summary?.tx_count ?? "N/A"}
            color="purple"
            loading={sl}
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
        </div>

        {/* Insights banner */}
        {canAnalyze && insights && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Financial Insights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-xs opacity-80 mb-1">Top spending category</div>
                <div className="font-bold">{insights.top_category || "No data yet"}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-xs opacity-80 mb-1">Average daily spend</div>
                <div className="font-bold">₹{Number(insights.avg_daily_spend || 0).toLocaleString("en-IN")}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-xs opacity-80 mb-1">Spending vs last month</div>
                <div className="font-bold">
                  {insights.spending_change_pct !== null && insights.spending_change_pct !== undefined
                    ? `${insights.spending_change_pct > 0 ? "+" : ""}${insights.spending_change_pct.toFixed(1)}%`
                    : "No prior data"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        {canAnalyze && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Monthly Overview</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />Income</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />Expenses</span>
                </div>
              </div>
              <MonthlyBar data={monthly} loading={ml} />
            </div>
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Spending by Category</h3>
                <span className="text-xs text-slate-400">{cats?.length || 0} categories</span>
              </div>
              <CategoryPie data={cats} loading={cl} />
            </div>
          </div>
        )}

        {/* Recent transactions */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Transactions</h3>
            <button
              onClick={() => nav("/transactions")}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View all
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="p-5">
            <TransactionTable data={recent} loading={rl} />
          </div>
        </div>

        {/* Viewer notice */}
        {!canAnalyze && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Viewer access</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                You can view transactions and basic summaries. Charts and detailed analytics are available to Analyst and Admin accounts.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
