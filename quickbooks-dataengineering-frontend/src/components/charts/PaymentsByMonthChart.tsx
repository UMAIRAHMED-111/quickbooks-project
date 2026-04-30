import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PaymentsByMonthResponse } from "@/types/metrics";
import { useChartTheme } from "@/lib/chart-theme";
import { formatCurrency, formatInteger } from "@/lib/format";

type Props = { data: PaymentsByMonthResponse };

export function PaymentsByMonthChart({ data }: Props) {
  const {
    chartGridColor,
    axisTickStyle,
    chartMonoScale,
    defaultChartMargin,
    tooltipContentStyle,
  } = useChartTheme();
  const series = data.series ?? [];
  if (series.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={series} margin={defaultChartMargin}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={chartGridColor}
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={axisTickStyle}
          axisLine={{ stroke: chartGridColor }}
        />
        <YAxis
          yAxisId="left"
          tick={axisTickStyle}
          axisLine={{ stroke: chartGridColor }}
          tickFormatter={(v) => formatCurrency(Number(v), { compact: true })}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={axisTickStyle}
          axisLine={{ stroke: chartGridColor }}
          tickFormatter={(v) => formatInteger(Number(v))}
        />
        <Tooltip
          formatter={(value, name) =>
            name === "Payment volume"
              ? formatCurrency(Number(value ?? 0))
              : formatInteger(Number(value ?? 0))
          }
          contentStyle={tooltipContentStyle}
        />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="total_amount"
          name="Payment volume"
          stroke={chartMonoScale.ink}
          fill={chartMonoScale.ink}
          fillOpacity={0.1}
          strokeWidth={2}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="payment_count"
          name="Payment count"
          stroke={chartMonoScale.inkMuted}
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
