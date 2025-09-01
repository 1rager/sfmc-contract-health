import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#4f46e5", "#eee"];

export default function Meter({ label, used, limit }) {
  const percent = Math.min(100, Math.round((used / limit) * 100));
  const data = [
    { name: "Used", value: percent },
    { name: "Remaining", value: 100 - percent },
  ];
  return (
    <div className="flex flex-col items-center">
      <div className="h-32 w-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={2}
              startAngle={90}
              endAngle={450}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip formatter={(v, n) => [`${v}%`, n]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-xs text-gray-500 mt-2">{label}</div>
      <div className="text-lg font-semibold">{used.toLocaleString()} / {limit.toLocaleString()}</div>
      <div className="text-2xl font-bold mt-1">{percent}%</div>
    </div>
  );
}