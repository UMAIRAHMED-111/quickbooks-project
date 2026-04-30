import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";
import type { PaidVsUnpaidResponse } from "@/types/metrics";
import { SquarePlotFrame } from "@/components/charts/SquarePlotFrame";
import { chartDualMonochrome } from "@/lib/chart-theme";
import { formatCurrency, formatInteger } from "@/lib/format";
import { cn } from "@/lib/utils";

const COLORS = [chartDualMonochrome.ink, chartDualMonochrome.inkMuted];

type Props = { data: PaidVsUnpaidResponse };

export function PaidVsUnpaidChart({ data }: Props) {
  const pieData = [
    { name: "Paid", value: data.paid_count },
    { name: "Unpaid", value: data.unpaid_count },
  ];
  const total = pieData.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  return (
    <SquarePlotFrame>
      <PieChart margin={{ top: 0, right: 0, bottom: 4, left: 0 }}>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="48%"
          innerRadius="38%"
          outerRadius="62%"
          paddingAngle={2}
        >
          {pieData.map((_, i) => (
            <Cell
              key={pieData[i].name}
              fill={COLORS[i % COLORS.length]}
              stroke="#f5f5f5"
              strokeWidth={1.5}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatInteger(Number(value ?? 0))}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            fontSize: 11,
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={22}
          wrapperStyle={{ fontSize: 11 }}
        />
      </PieChart>
    </SquarePlotFrame>
  );
}

export function PaidVsUnpaidAmountsNote({
  data,
  compact,
}: Props & { compact?: boolean }) {
  return (
    <p
      className={cn(
        "text-muted-foreground mt-2 leading-relaxed",
        compact ? "text-[0.65rem] leading-snug" : "text-xs",
      )}
    >
      Paid billed {formatCurrency(data.paid_total_billed)} · Unpaid open{" "}
      {formatCurrency(data.unpaid_open_balance)} · Unpaid billed{" "}
      {formatCurrency(data.unpaid_total_billed)}
    </p>
  );
}
