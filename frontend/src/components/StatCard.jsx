export default function StatCard({ label, value, sub, color = "blue", loading, icon, trend, trendUp }) {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-10 w-10 rounded-xl" />
          </div>
          <div className="skeleton h-8 w-32 mb-2" />
          <div className="skeleton h-3 w-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
        {icon && (
          <div className={`p-2.5 rounded-xl ${colors[color]} group-hover:scale-110 transition-transform duration-200`}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <p className={`text-2xl font-bold ${colors[color].split(' ')[2]} ${colors[color].split(' ')[3]}`}>
          {value}
        </p>
        
        <div className="flex items-center justify-between">
          {sub && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>
          )}
          
          {trend && (
            <div className={`flex items-center text-xs font-medium ${
              trendUp 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              <svg 
                className={`w-3 h-3 mr-1 ${trendUp ? '' : 'rotate-180'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l5-5 5 5M7 7l5 5 5-5" />
              </svg>
              {trend}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}