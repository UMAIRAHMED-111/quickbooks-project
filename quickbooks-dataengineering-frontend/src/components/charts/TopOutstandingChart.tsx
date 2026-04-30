import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TopOutstandingResponse } from "@/types/metrics";
import { useChartTheme } from "@/lib/chart-theme";
import { formatCurrency, truncateLabel } from "@/lib/format";

type Props = { data: TopOutstandingResponse };

export function TopOutstandingChart({ data }: Props) {
  const { chartGridColor, axisTickStyle, chartMonoScale, tooltipContentStyle } =
    useChartTheme();
  const rows = [...(data.customers ?? [])].reverse().map((c) => ({
    ...c,
    shortName: truncateLabel(c.customer_name, 24),
  }));

  if (rows.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, rows.length * 28)}>
      <BarChart
        layout="vertical"
        data={rows}
        margin={{ top: 4, right: 12, left: 2, bottom: 4 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={chartGridColor}
          horizontal={false}
        />
        <XAxis
          type="number"
          tick={axisTickStyle}
          axisLine={{ stroke: chartGridColor }}
          tickFormatter={(v) => formatCurrency(Number(v))}
        />
        <YAxis
          type="category"
          dataKey="shortName"
          width={112}
          tick={{ fill: axisTickStyle.fill, fontSize: 10 }}
          axisLine={{ stroke: chartGridColor }}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value ?? 0))}
          labelFormatter={(_, payload) => {
            const row = payload?.[0]?.payload as { customer_name?: string };
            return row?.customer_name ?? "";
          }}
          contentStyle={{ ...tooltipContentStyle, maxWidth: 280 }}
        />
        <Bar
          dataKey="customer_balance"
          fill={chartMonoScale.inkMuted}
          radius={[0, 6, 6, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
