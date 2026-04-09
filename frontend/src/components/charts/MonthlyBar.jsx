import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
            <span className="text-slate-600 dark:text-slate-400 capitalize">{p.name}:</span>
            <span className="font-semibold text-slate-900 dark:text-white">₹{Number(p.value).toLocaleString("en-IN")}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function MonthlyBar({ data = [], loading }) {
  if (loading) return <div className="skeleton h-64 w-full rounded-2xl" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
          formatter={(value) => <span style={{ color: "#64748b", textTransform: "capitalize" }}>{value}</span>}
        />
        <Bar dataKey="income" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}