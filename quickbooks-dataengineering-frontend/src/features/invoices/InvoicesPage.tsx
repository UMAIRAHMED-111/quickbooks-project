import { OverdueVsCurrentChart } from "@/components/charts/OverdueVsCurrentChart";
import { PaidOnTimeVsLateChart } from "@/components/charts/PaidOnTimeVsLateChart";
import {
  PaidVsUnpaidAmountsNote,
  PaidVsUnpaidChart,
} from "@/components/charts/PaidVsUnpaidChart";
import { SentVsUnsentChart } from "@/components/charts/SentVsUnsentChart";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ChartEmpty } from "@/components/dashboard/ChartEmpty";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import type { OverdueVsCurrentResponse } from "@/types/metrics";
import {
  useOverdueVsCurrent,
  usePaidOnTimeVsLate,
  usePaidVsUnpaid,
  useSentVsUnsent,
} from "@/features/dashboard/hooks/useMetrics";

function overdueUnpaidTotals(d: OverdueVsCurrentResponse) {
  const overdue =
    d.overdue_unpaid_count ??
    (d as { overdue_count?: number }).overdue_count ??
    0;
  const current =
    d.current_unpaid_count ??
    (d as { current_count?: number }).current_count ??
    0;
  return { overdue, current, total: overdue + current };
}

export function InvoicesPage() {
  const paidVsUnpaid = usePaidVsUnpaid();
  const sentVsUnsent = useSentVsUnsent();
  const overdueVsCurrent = useOverdueVsCurrent();
  const paidOnTime = usePaidOnTimeVsLate();

  return (
    <div className="space-y-8">
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
              {paidVsUnpaid.data.paid_count + paidVsUnpaid.data.unpaid_count >
              0 ? (
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
              <ChartEmpty
                square
                label="No overdue / current unpaid invoices."
              />
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
    </div>
  );
}
