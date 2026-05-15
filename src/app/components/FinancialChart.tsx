interface ChartData {
  name: string;
  value: number;
}

interface FinancialChartProps {
  data: ChartData[];
}

const COLORS = ["#E8A020", "#06b6d4", "#8b5cf6", "#10b981", "#f97316", "#3b82f6", "#ec4899", "#f59e0b"];

export function FinancialChart({ data }: FinancialChartProps) {
  const safeData = data
    .filter((item) => item.name != null && item.name !== "" && item.value > 0)
    .map((item, index) => ({ ...item, name: item.name ?? `Item ${index + 1}` }));

  if (safeData.length === 0) return null;

  const total = safeData.reduce((s, d) => s + d.value, 0);

  // Build SVG arc segments
  const R = 52; const r = 28; const CX = 64; const CY = 64;
  const segments: { d: string; color: string; name: string; value: number }[] = [];
  let angle = -Math.PI / 2;

  safeData.forEach((item, i) => {
    const pct   = item.value / total;
    const sweep = pct * 2 * Math.PI * 0.97; // 0.97 leaves a small gap
    const x1    = CX + R * Math.cos(angle);
    const y1    = CY + R * Math.sin(angle);
    const x2    = CX + R * Math.cos(angle + sweep);
    const y2    = CY + R * Math.sin(angle + sweep);
    const ix1   = CX + r * Math.cos(angle);
    const iy1   = CY + r * Math.sin(angle);
    const ix2   = CX + r * Math.cos(angle + sweep);
    const iy2   = CY + r * Math.sin(angle + sweep);
    const large = sweep > Math.PI ? 1 : 0;

    segments.push({
      d: `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${r} ${r} 0 ${large} 0 ${ix1} ${iy1} Z`,
      color: COLORS[i % COLORS.length],
      name: item.name,
      value: item.value,
    });
    angle += sweep + (2 * Math.PI * 0.03) / safeData.length;
  });

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Donut */}
      <svg width="128" height="128" viewBox="0 0 128 128">
        {segments.map((seg, i) => (
          <path key={i} d={seg.d} fill={seg.color} opacity={0.9} />
        ))}
        {/* Center text */}
        <text x={CX} y={CY - 4} textAnchor="middle" fontSize="10" fill="var(--text-subtle)" fontFamily="Inter, sans-serif">
          всего
        </text>
        <text x={CX} y={CY + 10} textAnchor="middle" fontSize="11" fill="var(--text-strong)" fontWeight="600" fontFamily="Inter, sans-serif">
          ₸{(total / 1000).toFixed(0)}к
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 px-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5 min-w-0">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-[10px] truncate max-w-[72px]" style={{ color: "var(--text-subtle)" }}>
              {seg.name}
            </span>
            <span className="text-[10px] font-medium shrink-0" style={{ color: "var(--text-muted-custom)" }}>
              {Math.round(seg.value / total * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
