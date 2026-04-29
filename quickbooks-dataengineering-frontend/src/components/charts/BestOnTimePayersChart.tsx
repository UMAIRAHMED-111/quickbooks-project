import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { BestOnTimeResponse } from "@/types/metrics"
import {
  axisTickStyle,
  chartGridColor,
  chartMonoScale,
  defaultChartMargin,
} from "@/lib/chart-theme"
import { formatInteger, truncateLabel } from "@/lib/format"

type Props = { data: BestOnTimeResponse }

export function BestOnTimePayersChart({ data }: Props) {
  const chartData = (data.customers ?? []).map((c) => ({
    name: truncateLabel(c.customer_name, 14),
    fullName: c.customer_name,
    onTime: c.on_time_paid_invoice_count,
    late: c.late_paid_invoice_count,
  }))

  if (chartData.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ ...defaultChartMargin, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: axisTickStyle.fill, fontSize: 10 }}
          axisLine={{ stroke: chartGridColor }}
          interval={0}
          angle={-28}
          textAnchor="end"
          height={48}
        />
        <YAxis
          tick={axisTickStyle}
          axisLine={{ stroke: chartGridColor }}
          tickFormatter={(v) => formatInteger(Number(v))}
        />
        <Tooltip
          formatter={(value) => formatInteger(Number(value ?? 0))}
          labelFormatter={(_, payload) => {
            const row = payload?.[0]?.payload as { fullName?: string }
            return row?.fullName ?? ""
          }}
          contentStyle={{
            borderRadius: 8,
            border: `1px solid ${chartGridColor}`,
            fontSize: 12,
            maxWidth: 300,
          }}
        />
        <Legend />
        <Bar dataKey="onTime" name="On time" fill={chartMonoScale.ink} radius={[4, 4, 0, 0]} />
        <Bar dataKey="late" name="Late" fill={chartMonoScale.inkMuted} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
