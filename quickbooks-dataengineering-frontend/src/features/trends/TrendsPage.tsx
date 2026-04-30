import { PaymentsByMonthChart } from "@/components/charts/PaymentsByMonthChart";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ChartEmpty } from "@/components/dashboard/ChartEmpty";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { Stat } from "@/components/dashboard/Stat";
import { BlockError } from "@/components/dashboard/BlockError";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardCardClass } from "@/lib/dashboard-styles";
import { formatCurrency, formatInteger } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  useAllocationsSummary,
  usePaymentsByMonth,
} from "@/features/dashboard/hooks/useMetrics";

export function TrendsPage() {
  const byMonth = usePaymentsByMonth();
  const allocations = useAllocationsSummary();

  return (
    <div className="space-y-8">
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
                <Stat
                  label="Allocations"
                  value={formatInteger(allocations.data.allocation_count)}
                />
                <Stat
                  label="Total allocated"
                  value={formatCurrency(allocations.data.total_allocated)}
                />
                <Stat
                  label="Payments w/ allocations"
                  value={formatInteger(
                    allocations.data.payments_with_allocations,
                  )}
                />
                <Stat
                  label="Invoices w/ allocations"
                  value={formatInteger(
                    allocations.data.invoices_with_allocations,
                  )}
                />
              </dl>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
