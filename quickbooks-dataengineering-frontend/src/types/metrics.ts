/** Mirrors Flask metrics JSON (partial / resilient to extra fields). */

export interface OverviewResponse {
  customer_count: number;
  invoice_count: number;
  payment_count: number;
  total_outstanding: number;
  total_invoiced: number;
  total_payments_recorded: number;
}

export interface PaidVsUnpaidResponse {
  paid_count: number;
  paid_total_billed: number;
  unpaid_count: number;
  unpaid_open_balance: number;
  unpaid_total_billed: number;
}

export interface SentVsUnsentBucket {
  email_sent: boolean;
  invoice_count: number;
  sum_total_amount?: number;
  sum_open_balance?: number;
}

export interface SentVsUnsentResponse {
  buckets: SentVsUnsentBucket[];
}

export interface OverdueVsCurrentResponse {
  overdue_unpaid_count?: number;
  overdue_unpaid_open_balance?: number;
  current_unpaid_count?: number;
  current_unpaid_open_balance?: number;
}

export interface PaidOnTimeVsLateResponse {
  paid_on_time_count: number;
  paid_late_count: number;
  paid_unknown_timing_count: number;
}

export interface TopPayingCustomer {
  customer_name: string;
  total_payments: number;
  payment_row_count: number;
}

export interface TopPayingResponse {
  customers: TopPayingCustomer[];
}

export interface TopOutstandingCustomer {
  customer_name: string;
  customer_balance: number;
  open_invoice_count: number;
}

export interface TopOutstandingResponse {
  customers: TopOutstandingCustomer[];
}

export interface TopOverdueCustomer {
  customer_name: string;
  overdue_open_balance: number;
  overdue_invoice_count: number;
}

export interface TopOverdueResponse {
  customers: TopOverdueCustomer[];
}

export interface BestOnTimeCustomer {
  customer_name: string;
  on_time_paid_invoice_count: number;
  late_paid_invoice_count: number;
}

export interface BestOnTimeResponse {
  customers: BestOnTimeCustomer[];
}

export interface PaymentMonthPoint {
  month: string;
  total_amount: number;
  payment_count: number;
}

export interface PaymentsByMonthResponse {
  series: PaymentMonthPoint[];
}

export interface AllocationsSummaryResponse {
  allocation_count: number;
  total_allocated: number;
  payments_with_allocations: number;
  invoices_with_allocations: number;
}

export interface SyncSuccessResponse {
  sync_run_id: string;
  status: string;
}

export type QaContextRole = "user" | "assistant";

/** Prior turns for follow-ups; chronological, oldest first. Omit the new question from this array. */
export interface QaContextMessage {
  role: QaContextRole;
  content: string;
}

export interface QaRequestBody {
  question: string;
  context?: QaContextMessage[];
}

export interface QaSuccessResponse {
  answer: string;
}
