import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface ChartData {
  name: string;
  value: number;
}

interface FinancialChartProps {
  data: ChartData[];
}

const COLORS = ["#0891b2", "#06b6d4", "#22d3ee", "#10b981", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899"];

// Defined outside component to avoid creating a new type on every render
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl border border-cyan-200/50 rounded-lg p-2 shadow-lg">
        <p className="font-medium text-gray-800 text-xs">{payload[0].name}</p>
        <p className="text-xs text-cyan-600 font-bold">₸{payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

const renderLegend = ({ payload }: any) => {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1 px-1">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-item-${index}`} className="flex items-center gap-1 min-w-0">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[10px] text-gray-600 truncate max-w-[70px]">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function FinancialChart({ data }: FinancialChartProps) {
  // Sanitize: filter out any items with null/undefined/empty names and ensure uniqueness
  const safeData = data
    .filter((item) => item.name != null && item.name !== "" && item.value > 0)
    .map((item, index) => ({
      ...item,
      // Guarantee a non-null name so recharts never gets a null key
      name: item.name ?? `Item ${index + 1}`,
    }));

  if (safeData.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <Pie
          key="pie"
          data={safeData}
          cx="50%"
          cy="45%"
          outerRadius={72}
          innerRadius={30}
          dataKey="value"
          nameKey="name"
          paddingAngle={2}
        >
          {safeData.map((_entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip key="tooltip" content={<CustomTooltip />} />
        <Legend key="legend" content={renderLegend} />
      </PieChart>
    </ResponsiveContainer>
  );
}