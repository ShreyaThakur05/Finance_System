import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import MonthlyBar from "../components/charts/MonthlyBar";
import CategoryPie from "../components/charts/CategoryPie";
import BalanceLine from "../components/charts/BalanceLine";
import StatCard from "../components/StatCard";
import { useAuth } from "../hooks/useAuth";

export default function Analytics() {
  const { hasRole } = useAuth();
  const canAnalyze = hasRole("analyst", "admin");

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

  const { data: ins, isLoading: il } = useQuery({
    queryKey: ["insights"],
    queryFn: () => api.get("/api/v1/analytics/insights").then((r) => r.data),
    enabled: canAnalyze,
  });

  if (!canAnalyze) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Access Restricted</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Analytics requires Analyst or Administrator access level.
          </p>
        </div>
      </div>
    );
  }

  const pct = ins?.spending_change_pct;
  const pctLabel = pct !== null && pct !== undefined ? `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%` : "N/A";
  const pctColor = pct > 0 ? "red" : pct < 0 ? "emerald" : "blue";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
          <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Analytics
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Detailed financial insights and spending patterns
        </p>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Insight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Top Spending Category"
            value={ins?.top_category || "No data"}
            color="blue"
            loading={il}
            icon={(
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            )}
          />
          <StatCard
            label="Highest Expense Month"
            value={ins?.highest_expense_month || "No data"}
            color="red"
            loading={il}
            icon={(
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          />
          <StatCard
            label="Spending Change"
            value={pctLabel}
            color={pctColor}
            sub="vs previous month"
            loading={il}
            icon={(
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            )}
            trend={pctLabel}
            trendUp={pct <= 0}
          />
          <StatCard
            label="Avg Daily Spend"
            value={ins ? `₹${Number(ins.avg_daily_spend).toLocaleString("en-IN")}` : "N/A"}
            color="purple"
            loading={il}
            icon={(
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Monthly Income vs Expenses
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                Last 12 months
              </span>
            </div>
            <MonthlyBar data={monthly} loading={ml} />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Net Balance Trend
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                Last 12 months
              </span>
            </div>
            <BalanceLine data={monthly} loading={ml} />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Spending by Category
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
              {cats?.length || 0} categories
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <CategoryPie data={cats} loading={cl} />
            <div className="space-y-3">
              {cl
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton h-10 rounded-xl" />
                  ))
                : cats?.map((c, i) => {
                    const barColors = [
                      "bg-blue-500", "bg-red-500", "bg-emerald-500", "bg-amber-500",
                      "bg-purple-500", "bg-pink-500", "bg-teal-500", "bg-orange-500"
                    ];
                    return (
                      <div key={c.category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className={`w-3 h-3 rounded-full ${barColors[i % barColors.length]}`}></div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{c.category}</span>
                        </div>
                        <div className="flex items-center gap-4 ml-4">
                          <div className="w-28 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${barColors[i % barColors.length]} rounded-full transition-all duration-500`}
                              style={{ width: `${c.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right">
                            {c.percentage}%
                          </span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white w-20 text-right">
                            ₹{Number(c.amount).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}