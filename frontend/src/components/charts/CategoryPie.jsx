import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{d.name}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          ₹{Number(d.value).toLocaleString("en-IN")} ({d.payload.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

export default function CategoryPie({ data = [], loading }) {
  if (loading) return <div className="skeleton h-64 w-full rounded-2xl" />;
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500">
        <svg className="w-10 h-10 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        </svg>
        <p className="text-sm">No expense data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={50}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}