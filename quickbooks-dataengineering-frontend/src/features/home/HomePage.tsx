import { AlertTriangle, ArrowRight, FileText, TrendingUp, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { BlockError } from "@/components/dashboard/BlockError"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { KpiSkeleton } from "@/components/dashboard/KpiSkeleton"
import { SectionHeader } from "@/components/dashboard/SectionHeader"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiRequestError } from "@/lib/api"
import { dashboardCardClass } from "@/lib/dashboard-styles"
import { formatCurrency, formatInteger } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useOverview } from "@/features/dashboard/hooks/useMetrics"

const navTiles = [
  {
    to: "/invoices",
    icon: FileText,
    title: "Invoices",
    description: "Cash flow, aging, and payment timing",
    detail: "Paid vs unpaid · Sent vs unsent · Overdue vs current · On-time vs late",
  },
  {
    to: "/customers",
    icon: Users,
    title: "Customers",
    description: "Who pays, who owes, and who is overdue",
    detail: "Top paying · Top outstanding · Overdue debt · Best on-time payers",
  },
  {
    to: "/trends",
    icon: TrendingUp,
    title: "Trends",
    description: "Cash movement and payment–invoice links",
    detail: "Payments by month · Allocations summary",
  },
]

export function HomePage() {
  const overview = useOverview()
  const overview503 =
    overview.error instanceof ApiRequestError && overview.error.status === 503

  return (
    <div className="space-y-12">
      {overview503 ? (
        <Alert variant="destructive" className="border-destructive/30 shadow-sm">
          <AlertTriangle className="size-4" />
          <AlertTitle>Metrics unavailable</AlertTitle>
          <AlertDescription>
            The API could not reach the database (HTTP 503). Confirm{" "}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">DATABASE_URL</code> on the
            server and that{" "}
            <code className="bg-muted rounded px-1 py-0.5 text-xs">python server.py</code> is
            running.
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
          title="Explore"
          description="Drill into invoices, customers, or payment trends."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {navTiles.map(({ to, icon: Icon, title, description, detail }) => (
            <Link key={to} to={to} className="block">
              <Card
                className={cn(
                  dashboardCardClass,
                  "h-full cursor-pointer transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="bg-muted/60 mb-3 flex size-12 items-center justify-center rounded-xl">
                    <Icon className="size-5 text-foreground" aria-hidden />
                  </div>
                  <CardTitle className="text-base font-semibold">{title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground mb-4 text-xs leading-relaxed">{detail}</p>
                  <div className="text-primary flex items-center gap-1 text-sm font-medium">
                    View details
                    <ArrowRight className="size-3.5" aria-hidden />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
