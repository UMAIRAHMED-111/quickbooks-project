import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { SquarePlotFrame } from "@/components/charts/SquarePlotFrame"
import type { PaidOnTimeVsLateResponse } from "@/types/metrics"
import {
  axisTickStyle,
  chartGridColor,
  chartMonoScale,
  defaultChartMargin,
} from "@/lib/chart-theme"
import { formatInteger } from "@/lib/format"

type Props = { data: PaidOnTimeVsLateResponse; variant?: "default" | "grid" }

export function PaidOnTimeVsLateChart({ data, variant = "default" }: Props) {
  const chartData = [
    { label: "On time", count: data.paid_on_time_count },
    { label: "Late", count: data.paid_late_count },
    { label: "Unknown", count: data.paid_unknown_timing_count },
  ]
  const total = chartData.reduce((s, d) => s + d.count, 0)
  if (total === 0) return null

  const colors = [chartMonoScale.ink, chartMonoScale.inkMuted, chartMonoScale.inkLight]

  const chart = (
    <BarChart data={chartData} margin={defaultChartMargin}>
      <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
      <XAxis dataKey="label" tick={axisTickStyle} axisLine={{ stroke: chartGridColor }} />
      <YAxis
        tick={axisTickStyle}
        axisLine={{ stroke: chartGridColor }}
        tickFormatter={(v) => formatInteger(Number(v))}
      />
      <Tooltip
        formatter={(value) => formatInteger(Number(value ?? 0))}
        contentStyle={{
          borderRadius: 8,
          border: `1px solid ${chartGridColor}`,
          fontSize: 11,
        }}
      />
      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
        {chartData.map((_, i) => (
          <Cell key={chartData[i].label} fill={colors[i]} />
        ))}
      </Bar>
    </BarChart>
  )

  if (variant === "grid") {
    return <SquarePlotFrame>{chart}</SquarePlotFrame>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      {chart}
    </ResponsiveContainer>
  )
}
