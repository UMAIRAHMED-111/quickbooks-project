import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QaRequestBody } from "@/types/metrics";
import {
  askWarehouse,
  getAllocationsSummary,
  getBestOnTimePayers,
  getOverview,
  getOverdueVsCurrent,
  getPaidOnTimeVsLate,
  getPaidVsUnpaid,
  getPaymentsByMonth,
  getSentVsUnsent,
  getTopOutstanding,
  getTopOverdueDebt,
  getTopPaying,
  postSync,
} from "@/lib/api";

export const metricsKeys = {
  all: ["metrics"] as const,
  overview: () => [...metricsKeys.all, "overview"] as const,
  paidVsUnpaid: () =>
    [...metricsKeys.all, "invoices", "paid-vs-unpaid"] as const,
  sentVsUnsent: () =>
    [...metricsKeys.all, "invoices", "sent-vs-unsent"] as const,
  overdueVsCurrent: () =>
    [...metricsKeys.all, "invoices", "overdue-vs-current"] as const,
  paidOnTimeVsLate: () =>
    [...metricsKeys.all, "invoices", "paid-on-time-vs-late"] as const,
  topPaying: (limit: number) =>
    [...metricsKeys.all, "customers", "top-paying", limit] as const,
  topOutstanding: (limit: number) =>
    [...metricsKeys.all, "customers", "top-outstanding", limit] as const,
  topOverdue: (limit: number) =>
    [...metricsKeys.all, "customers", "top-overdue", limit] as const,
  bestOnTime: (limit: number) =>
    [...metricsKeys.all, "customers", "best-on-time", limit] as const,
  paymentsByMonth: () => [...metricsKeys.all, "payments", "by-month"] as const,
  allocations: () => [...metricsKeys.all, "allocations", "summary"] as const,
};

const stale = 60_000;

export function useOverview() {
  return useQuery({
    queryKey: metricsKeys.overview(),
    queryFn: getOverview,
    staleTime: stale,
  });
}

export function usePaidVsUnpaid() {
  return useQuery({
    queryKey: metricsKeys.paidVsUnpaid(),
    queryFn: getPaidVsUnpaid,
    staleTime: stale,
  });
}

export function useSentVsUnsent() {
  return useQuery({
    queryKey: metricsKeys.sentVsUnsent(),
    queryFn: getSentVsUnsent,
    staleTime: stale,
  });
}

export function useOverdueVsCurrent() {
  return useQuery({
    queryKey: metricsKeys.overdueVsCurrent(),
    queryFn: getOverdueVsCurrent,
    staleTime: stale,
  });
}

export function usePaidOnTimeVsLate() {
  return useQuery({
    queryKey: metricsKeys.paidOnTimeVsLate(),
    queryFn: getPaidOnTimeVsLate,
    staleTime: stale,
  });
}

export function useTopPaying(limit = 10) {
  return useQuery({
    queryKey: metricsKeys.topPaying(limit),
    queryFn: () => getTopPaying(limit),
    staleTime: stale,
  });
}

export function useTopOutstanding(limit = 10) {
  return useQuery({
    queryKey: metricsKeys.topOutstanding(limit),
    queryFn: () => getTopOutstanding(limit),
    staleTime: stale,
  });
}

export function useTopOverdueDebt(limit = 10) {
  return useQuery({
    queryKey: metricsKeys.topOverdue(limit),
    queryFn: () => getTopOverdueDebt(limit),
    staleTime: stale,
  });
}

export function useBestOnTimePayers(limit = 10) {
  return useQuery({
    queryKey: metricsKeys.bestOnTime(limit),
    queryFn: () => getBestOnTimePayers(limit),
    staleTime: stale,
  });
}

export function usePaymentsByMonth() {
  return useQuery({
    queryKey: metricsKeys.paymentsByMonth(),
    queryFn: getPaymentsByMonth,
    staleTime: stale,
  });
}

export function useAllocationsSummary() {
  return useQuery({
    queryKey: metricsKeys.allocations(),
    queryFn: getAllocationsSummary,
    staleTime: stale,
  });
}

export function useSyncMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postSync,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: metricsKeys.all });
    },
  });
}

export function useWarehouseQaMutation() {
  return useMutation({
    mutationFn: (body: QaRequestBody) => askWarehouse(body),
  });
}
