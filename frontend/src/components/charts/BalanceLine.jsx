import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{label}</p>
        <p className={`text-sm font-bold ${val >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
          {val >= 0 ? "+" : ""}₹{Number(val).toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

export default function BalanceLine({ data = [], loading }) {
  if (loading) return <div className="skeleton h-64 w-full rounded-2xl" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
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
        <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="net"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}