import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts"
import type { OverdueVsCurrentResponse } from "@/types/metrics"
import { SquarePlotFrame } from "@/components/charts/SquarePlotFrame"
import { chartDualMonochrome } from "@/lib/chart-theme"
import { formatCurrency, formatInteger } from "@/lib/format"

const COLORS = [chartDualMonochrome.ink, chartDualMonochrome.inkMuted]

type Props = { data: OverdueVsCurrentResponse }

export function OverdueVsCurrentChart({ data }: Props) {
  const overdue =
    data.overdue_unpaid_count ??
    (data as { overdue_count?: number }).overdue_count ??
    0
  const current =
    data.current_unpaid_count ??
    (data as { current_count?: number }).current_count ??
    0
  const pieData = [
    { name: "Overdue unpaid", value: overdue },
    { name: "Current unpaid", value: current },
  ]
  const total = pieData.reduce((s, d) => s + d.value, 0)
  if (total === 0) return null

  const overdueAmt =
    data.overdue_unpaid_open_balance ??
    (data as { overdue_unpaid_amount?: number }).overdue_unpaid_amount ??
    0
  const currentAmt =
    data.current_unpaid_open_balance ??
    (data as { current_unpaid_amount?: number }).current_unpaid_amount ??
    0

  return (
    <div className="space-y-2">
      <SquarePlotFrame>
        <PieChart margin={{ top: 0, right: 0, bottom: 4, left: 0 }}>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="48%"
            innerRadius="36%"
            outerRadius="58%"
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
          <Legend verticalAlign="bottom" height={22} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </SquarePlotFrame>
      <p className="text-muted-foreground text-center text-xs">
        Open balance · Overdue {formatCurrency(overdueAmt)} · Current{" "}
        {formatCurrency(currentAmt)}
      </p>
    </div>
  )
}
