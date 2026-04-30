import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SquarePlotFrame } from "@/components/charts/SquarePlotFrame";
import type { SentVsUnsentResponse } from "@/types/metrics";
import { useChartTheme } from "@/lib/chart-theme";
import { formatCurrency, formatInteger } from "@/lib/format";

type Props = { data: SentVsUnsentResponse; variant?: "default" | "grid" };

type BucketRow = {
  label: string;
  email_sent: boolean;
  invoice_count: number;
  sum_total_amount: number;
  sum_open_balance: number;
};

function SentVsUnsentTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload: BucketRow }>;
}) {
  if (!active || !payload?.[0]) return null;
  const row = payload[0].payload;
  return (
    <div className="border-border bg-popover text-popover-foreground rounded-lg border px-3 py-2 text-xs shadow-md">
      <p className="mb-1.5 font-semibold">{row.label}</p>
      <p className="tabular-nums">
        <span className="text-foreground font-medium">Invoices</span>
        <span className="text-muted-foreground">
          {" "}
          · {formatInteger(row.invoice_count)}
        </span>
      </p>
      <p className="text-muted-foreground mt-1 tabular-nums">
        Total billed · {formatCurrency(row.sum_total_amount)}
      </p>
      <p className="text-muted-foreground mt-0.5 tabular-nums">
        Open balance · {formatCurrency(row.sum_open_balance)}
      </p>
    </div>
  );
}

export function SentVsUnsentChart({ data, variant = "default" }: Props) {
  const {
    chartGridColor,
    axisTickStyle,
    chartDualMonochrome,
    defaultChartMargin,
  } = useChartTheme();

  const chartData: BucketRow[] = (data.buckets ?? []).map((b) => ({
    label: b.email_sent ? "Email sent" : "Not sent",
    email_sent: b.email_sent,
    invoice_count: b.invoice_count,
    sum_total_amount: b.sum_total_amount ?? 0,
    sum_open_balance: b.sum_open_balance ?? 0,
  }));

  if (chartData.length === 0) return null;

  const chart = (
    <BarChart data={chartData} margin={defaultChartMargin}>
      <CartesianGrid
        strokeDasharray="3 3"
        stroke={chartGridColor}
        vertical={false}
      />
      <XAxis
        dataKey="label"
        tick={axisTickStyle}
        axisLine={{ stroke: chartGridColor }}
      />
      <YAxis
        tick={axisTickStyle}
        axisLine={{ stroke: chartGridColor }}
        tickFormatter={(v) => formatInteger(Number(v))}
      />
      <Tooltip
        cursor={{ fill: "rgba(0,0,0,0.04)" }}
        content={<SentVsUnsentTooltip />}
      />
      <Bar dataKey="invoice_count" name="Invoices" radius={[6, 6, 0, 0]}>
        {chartData.map((row, i) => (
          <Cell
            key={`${row.email_sent}-${i}`}
            fill={
              row.email_sent
                ? chartDualMonochrome.ink
                : chartDualMonochrome.inkMuted
            }
          />
        ))}
      </Bar>
    </BarChart>
  );

  if (variant === "grid") {
    return <SquarePlotFrame>{chart}</SquarePlotFrame>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      {chart}
    </ResponsiveContainer>
  );
}
