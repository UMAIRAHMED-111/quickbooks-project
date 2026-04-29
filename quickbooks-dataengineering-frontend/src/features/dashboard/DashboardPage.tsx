import { AlertTriangle } from "lucide-react"
import type { ReactNode } from "react"
import { useState } from "react"
import { toast } from "sonner"
import { AppShell } from "@/components/layout/AppShell"
import { BestOnTimePayersChart } from "@/components/charts/BestOnTimePayersChart"
import { OverdueVsCurrentChart } from "@/components/charts/OverdueVsCurrentChart"
import { PaidOnTimeVsLateChart } from "@/components/charts/PaidOnTimeVsLateChart"
import {
  PaidVsUnpaidAmountsNote,
  PaidVsUnpaidChart,
} from "@/components/charts/PaidVsUnpaidChart"
import { PaymentsByMonthChart } from "@/components/charts/PaymentsByMonthChart"
import { SentVsUnsentChart } from "@/components/charts/SentVsUnsentChart"
import { TopOutstandingChart } from "@/components/charts/TopOutstandingChart"
import { TopOverdueDebtChart } from "@/components/charts/TopOverdueDebtChart"
import { TopPayingChart } from "@/components/charts/TopPayingChart"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApiRequestError } from "@/lib/api"
import { dashboardCardClass } from "@/lib/dashboard-styles"
import { getErrorMessage } from "@/lib/errorCodes"
import { formatCurrency, formatInteger } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { OverdueVsCurrentResponse } from "@/types/metrics"
import { WarehouseChatWidget } from "@/features/dashboard/WarehouseChatWidget"
import {
  useAllocationsSummary,
  useBestOnTimePayers,
  useOverview,
  useOverdueVsCurrent,
  usePaidOnTimeVsLate,
  usePaidVsUnpaid,
  usePaymentsByMonth,
  useSentVsUnsent,
  useSyncMutation,
  useTopOutstanding,
  useTopOverdueDebt,
  useTopPaying,
} from "@/features/dashboard/hooks/useMetrics"

function ChartEmpty({ label, square }: { label: string; square?: boolean }) {
  return (
    <div
      className={cn(
        "bg-muted/20 text-muted-foreground flex items-center justify-center rounded-xl border border-dashed border-border/70 px-4 text-center text-sm leading-relaxed",
        square
          ? "mx-auto aspect-square w-full max-w-[220px] min-h-0 text-xs"
          : "min-h-[168px] px-6"
      )}
    >
      {label}
    </div>
  )
}

function overdueUnpaidTotals(d: OverdueVsCurrentResponse) {
  const overdue =
    d.overdue_unpaid_count ?? (d as { overdue_count?: number }).overdue_count ?? 0
  const current =
    d.current_unpaid_count ?? (d as { current_count?: number }).current_count ?? 0
  return { overdue, current, total: overdue + current }
}

function BlockError({ error }: { error: unknown }) {
  const is503 = error instanceof ApiRequestError && error.status === 503
  return (
    <Alert variant={is503 ? "destructive" : "default"}>
      <AlertTriangle className="size-4" />
      <AlertTitle>Unable to load this block</AlertTitle>
      <AlertDescription>{getErrorMessage(error)}</AlertDescription>
    </Alert>
  )
}

function KpiSkeleton() {
  return (
    <Card className={cn(dashboardCardClass)}>
      <CardHeader className="pb-2">
        <Skeleton className="h-3 w-24 rounded-md" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 rounded-md" />
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const overview = useOverview()
  const paidVsUnpaid = usePaidVsUnpaid()
  const sentVsUnsent = useSentVsUnsent()
  const overdueVsCurrent = useOverdueVsCurrent()
  const paidOnTime = usePaidOnTimeVsLate()
  const topPaying = useTopPaying(10)
  const topOutstanding = useTopOutstanding(10)
  const topOverdue = useTopOverdueDebt(10)
  const bestOnTime = useBestOnTimePayers(10)
  const byMonth = usePaymentsByMonth()
  const allocations = useAllocationsSummary()
  const sync = useSyncMutation()
  const [dataEpoch, setDataEpoch] = useState(0)

  const handleRefresh = () => {
    sync.mutate(undefined, {
      onSuccess: () => {
        toast.success("Warehouse refreshed. Metrics updated.")
        setDataEpoch((n) => n + 1)
      },
      onError: (e) => {
        toast.error(getErrorMessage(e))
      },
    })
  }

  const overview503 =
    overview.error instanceof ApiRequestError && overview.error.status === 503

  return (
    <AppShell onRefresh={handleRefresh} isRefreshing={sync.isPending}>
      <div className="space-y-12 md:space-y-14">
        {overview503 ? (
          <Alert variant="destructive" className="border-destructive/30 shadow-sm">
            <AlertTriangle className="size-4" />
            <AlertTitle>Metrics unavailable</AlertTitle>
            <AlertDescription>
              The API could not reach the database (HTTP 503). Confirm{" "}
              <code className="bg-muted rounded px-1 py-0.5 text-xs">DATABASE_URL</code> on the
              server and that <code className="bg-muted rounded px-1 py-0.5 text-xs">python server.py</code>{" "}
              is running.
            </AlertDescription>
          </Alert>
        ) : null}

        <section className="space-y-5">
          <SectionHeader
            title="Overview"
            description="Snapshot counts and totals for the synced company."
          />
          {overview.isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <KpiSkeleton key={i} />
              ))}
            </div>
          ) : overview.error ? (
            <BlockError error={overview.error} />
          ) : overview.data ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
              <KpiCard label="Customers" value={formatInteger(overview.data.customer_count)} />
              <KpiCard label="Invoices" value={formatInteger(overview.data.invoice_count)} />
              <KpiCard label="Payments" value={formatInteger(overview.data.payment_count)} />
              <KpiCard
                label="Outstanding"
                value={formatCurrency(overview.data.total_outstanding)}
              />
              <KpiCard label="Invoiced" value={formatCurrency(overview.data.total_invoiced)} />
              <KpiCard
                label="Payments recorded"
                value={formatCurrency(overview.data.total_payments_recorded)}
              />
            </div>
          ) : null}
        </section>

        <section className="space-y-5">
          <SectionHeader
            title="Invoices"
            description="Cash vs AR, delivery, aging, and payment timing."
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4 xl:gap-3">
            <ChartCard
              title="Paid vs unpaid"
              description="Counts by status. Black = paid, purple = unpaid."
              loading={paidVsUnpaid.isLoading}
              error={paidVsUnpaid.error}
              compact
              skeletonSquare
              className="min-w-0"
            >
              {paidVsUnpaid.data ? (
                <>
                  {paidVsUnpaid.data.paid_count + paidVsUnpaid.data.unpaid_count > 0 ? (
                    <PaidVsUnpaidChart data={paidVsUnpaid.data} />
                  ) : (
                    <ChartEmpty square label="No invoice split data." />
                  )}
                  <PaidVsUnpaidAmountsNote compact data={paidVsUnpaid.data} />
                </>
              ) : null}
            </ChartCard>

            <ChartCard
              title="Sent vs unsent"
              description="Black = email sent, purple = not sent. Hover a bar for billed and open balance."
              loading={sentVsUnsent.isLoading}
              error={sentVsUnsent.error}
              compact
              skeletonSquare
              className="min-w-0"
            >
              {sentVsUnsent.data?.buckets?.length ? (
                <SentVsUnsentChart variant="grid" data={sentVsUnsent.data} />
              ) : sentVsUnsent.data ? (
                <ChartEmpty square label="No sent/unsent buckets returned." />
              ) : null}
            </ChartCard>

            <ChartCard
              title="Overdue vs current (unpaid)"
              description="Counts by aging. Black = overdue unpaid, purple = current unpaid."
              loading={overdueVsCurrent.isLoading}
              error={overdueVsCurrent.error}
              compact
              skeletonSquare
              className="min-w-0"
            >
              {overdueVsCurrent.data ? (
                overdueUnpaidTotals(overdueVsCurrent.data).total > 0 ? (
                  <OverdueVsCurrentChart data={overdueVsCurrent.data} />
                ) : (
                  <ChartEmpty square label="No overdue / current unpaid invoices." />
                )
              ) : null}
            </ChartCard>

            <ChartCard
              title="Paid on time vs late"
              description="On time, late, unknown — black, dark purple, lighter violet."
              loading={paidOnTime.isLoading}
              error={paidOnTime.error}
              compact
              skeletonSquare
              className="min-w-0"
            >
              {paidOnTime.data &&
              paidOnTime.data.paid_on_time_count +
                paidOnTime.data.paid_late_count +
                paidOnTime.data.paid_unknown_timing_count >
                0 ? (
                <PaidOnTimeVsLateChart variant="grid" data={paidOnTime.data} />
              ) : paidOnTime.data ? (
                <ChartEmpty square label="No on-time / late timing data." />
              ) : null}
            </ChartCard>
          </div>
        </section>

        <section className="space-y-5">
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
              description="Open balance (top 10). Purple bars vs black in “Top paying”."
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
        </section>

        <section className="space-y-5">
          <SectionHeader
            title="Trends & allocations"
            description="Cash movement and payment–invoice links."
          />
          <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
            <ChartCard
              title="Payments by month"
              description="Black area = dollars; purple line = payment count."
              loading={byMonth.isLoading}
              error={byMonth.error}
            >
              {byMonth.data?.series?.length ? (
                <PaymentsByMonthChart data={byMonth.data} />
              ) : byMonth.data ? (
                <ChartEmpty label="No monthly payment series." />
              ) : null}
            </ChartCard>

            <Card className={cn(dashboardCardClass, "h-full")}>
              <CardHeader>
                <CardTitle className="text-base">Allocations summary</CardTitle>
                <CardDescription>
                  How payments tie to invoice lines in the warehouse.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allocations.isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : allocations.error ? (
                  <BlockError error={allocations.error} />
                ) : allocations.data ? (
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <Stat label="Allocations" value={formatInteger(allocations.data.allocation_count)} />
                    <Stat
                      label="Total allocated"
                      value={formatCurrency(allocations.data.total_allocated)}
                    />
                    <Stat
                      label="Payments w/ allocations"
                      value={formatInteger(allocations.data.payments_with_allocations)}
                    />
                    <Stat
                      label="Invoices w/ allocations"
                      value={formatInteger(allocations.data.invoices_with_allocations)}
                    />
                  </dl>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </section>

      </div>
      <WarehouseChatWidget dataEpoch={dataEpoch} />
    </AppShell>
  )
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-border/70 max-w-3xl border-l-2 border-l-primary/40 pl-4 md:pl-5">
      <h2 className="text-foreground text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <Card
      className={cn(
        dashboardCardClass,
        "group transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      )}
    >
      <CardHeader className="pb-1">
        <CardDescription className="text-muted-foreground text-[0.7rem] font-semibold tracking-wide uppercase">
          {label}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-foreground text-lg font-semibold tabular-nums tracking-tight md:text-xl">
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background/80 border-border/50 rounded-xl border px-3.5 py-3 shadow-sm">
      <dt className="text-muted-foreground text-[0.7rem] font-semibold tracking-wide uppercase">
        {label}
      </dt>
      <dd className="text-foreground mt-1 text-base font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

function ChartCard({
  title,
  description,
  loading,
  error,
  className,
  children,
  compact,
  skeletonSquare,
}: {
  title: string
  description: string
  loading: boolean
  error: unknown
  className?: string
  children: ReactNode
  compact?: boolean
  skeletonSquare?: boolean
}) {
  return (
    <Card className={cn(dashboardCardClass, "h-full", compact && "gap-3 py-3", className)}>
      <CardHeader className={cn(compact ? "gap-0.5 px-4 pb-2 pt-0" : "pb-3")}>
        <CardTitle
          className={cn("font-semibold tracking-tight", compact ? "text-sm" : "text-base")}
        >
          {title}
        </CardTitle>
        <CardDescription
          className={cn(compact ? "line-clamp-2 text-xs leading-snug" : "text-sm leading-relaxed")}
        >
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-3", compact ? "px-4 pb-3 pt-0" : "pt-0")}>
        {loading ? (
          skeletonSquare ? (
            <Skeleton className="mx-auto aspect-square w-full max-w-[220px] rounded-xl" />
          ) : (
            <Skeleton className="h-[200px] w-full rounded-xl" />
          )
        ) : error ? (
          <BlockError error={error} />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
