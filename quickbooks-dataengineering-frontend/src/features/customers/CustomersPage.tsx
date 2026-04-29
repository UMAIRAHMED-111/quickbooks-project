import { BestOnTimePayersChart } from "@/components/charts/BestOnTimePayersChart"
import { TopOutstandingChart } from "@/components/charts/TopOutstandingChart"
import { TopOverdueDebtChart } from "@/components/charts/TopOverdueDebtChart"
import { TopPayingChart } from "@/components/charts/TopPayingChart"
import { ChartCard } from "@/components/dashboard/ChartCard"
import { ChartEmpty } from "@/components/dashboard/ChartEmpty"
import { SectionHeader } from "@/components/dashboard/SectionHeader"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatInteger } from "@/lib/format"
import {
  useBestOnTimePayers,
  useTopOutstanding,
  useTopOverdueDebt,
  useTopPaying,
} from "@/features/dashboard/hooks/useMetrics"

export function CustomersPage() {
  const topPaying = useTopPaying(10)
  const topOutstanding = useTopOutstanding(10)
  const topOverdue = useTopOverdueDebt(10)
  const bestOnTime = useBestOnTimePayers(10)

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Customers"
        description="Who pays, who owes, and who is overdue."
      />
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        <ChartCard
          title="Top paying"
          description="Total payments (top 10). Monochrome bars."
          loading={topPaying.isLoading}
          error={topPaying.error}
        >
          {topPaying.data?.customers?.length ? (
            <TopPayingChart data={topPaying.data} />
          ) : topPaying.data ? (
            <ChartEmpty label="No customer payment rankings." />
          ) : null}
        </ChartCard>

        <ChartCard
          title="Top outstanding"
          description={'Open balance (top 10). Purple bars vs black in "Top paying".'}
          loading={topOutstanding.isLoading}
          error={topOutstanding.error}
        >
          {topOutstanding.data?.customers?.length ? (
            <TopOutstandingChart data={topOutstanding.data} />
          ) : topOutstanding.data ? (
            <ChartEmpty label="No outstanding balances." />
          ) : null}
        </ChartCard>

        <ChartCard
          title="Top overdue debt"
          description="Overdue balance (top 10). Black bars."
          loading={topOverdue.isLoading}
          error={topOverdue.error}
          className="lg:col-span-2"
        >
          {topOverdue.data?.customers?.length ? (
            <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
              <TopOverdueDebtChart data={topOverdue.data} />
              <div className="border-border/50 bg-muted/15 overflow-hidden rounded-xl border shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/35">
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Overdue</TableHead>
                      <TableHead className="text-right">Invoices</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topOverdue.data.customers.map((c) => (
                      <TableRow key={c.customer_name}>
                        <TableCell className="max-w-[200px] truncate font-medium">
                          {c.customer_name}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(c.overdue_open_balance)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatInteger(c.overdue_invoice_count)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : topOverdue.data ? (
            <ChartEmpty label="No overdue debt rows." />
          ) : null}
        </ChartCard>

        <ChartCard
          title="Best on-time payers"
          description="Black = on-time count, purple = late (top 10)."
          loading={bestOnTime.isLoading}
          error={bestOnTime.error}
          className="lg:col-span-2"
        >
          {bestOnTime.data?.customers?.length ? (
            <BestOnTimePayersChart data={bestOnTime.data} />
          ) : bestOnTime.data ? (
            <ChartEmpty label="No on-time payer rankings." />
          ) : null}
        </ChartCard>
      </div>
    </div>
  )
}
