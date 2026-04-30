import type {
  AllocationsSummaryResponse,
  BestOnTimeResponse,
  OverdueVsCurrentResponse,
  OverviewResponse,
  PaidOnTimeVsLateResponse,
  PaidVsUnpaidResponse,
  PaymentsByMonthResponse,
  QaContextMessage,
  QaRequestBody,
  QaSuccessResponse,
  SentVsUnsentResponse,
  SyncSuccessResponse,
  TopOutstandingResponse,
  TopOverdueResponse,
  TopPayingResponse,
} from "@/types/metrics";

/** Mirrors server defaults (WAREHOUSE_QA_*); oldest dropped first when trimming. */
const QA_CONTEXT_MAX_MESSAGES = 24;
const QA_CONTEXT_MAX_CHARS = 12_000;

function qaContextCharTotal(ctx: QaContextMessage[]): number {
  return ctx.reduce((n, m) => n + m.content.length, 0);
}

function trimWarehouseQaContext(
  context: QaContextMessage[],
): QaContextMessage[] {
  let slice = context.slice(-QA_CONTEXT_MAX_MESSAGES);
  while (slice.length > 1 && qaContextCharTotal(slice) > QA_CONTEXT_MAX_CHARS) {
    slice = slice.slice(1);
  }
  return slice;
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.body = body;
  }
}

function getBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:5050";
  return base.replace(/\/$/, "");
}

function syncAuthHeaders(): Headers {
  const headers = new Headers();
  const token = import.meta.env.VITE_SYNC_TOKEN;
  if (token) {
    headers.set("X-Sync-Token", token);
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiRequestError("Invalid JSON from server", res.status, text);
  }
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    headers: { Accept: "application/json" },
  });
  const body = await parseJson<unknown>(res).catch(() => ({}));
  if (!res.ok) {
    throw new ApiRequestError(`GET ${path} failed`, res.status, body);
  }
  return body as T;
}

export async function getOverview(): Promise<OverviewResponse> {
  return apiGet("/api/v1/metrics/overview");
}

export async function getPaidVsUnpaid(): Promise<PaidVsUnpaidResponse> {
  return apiGet("/api/v1/metrics/invoices/paid-vs-unpaid");
}

export async function getSentVsUnsent(): Promise<SentVsUnsentResponse> {
  return apiGet("/api/v1/metrics/invoices/sent-vs-unsent");
}

export async function getOverdueVsCurrent(): Promise<OverdueVsCurrentResponse> {
  return apiGet("/api/v1/metrics/invoices/overdue-vs-current");
}

export async function getPaidOnTimeVsLate(): Promise<PaidOnTimeVsLateResponse> {
  return apiGet("/api/v1/metrics/invoices/paid-on-time-vs-late");
}

export async function getTopPaying(limit = 10): Promise<TopPayingResponse> {
  return apiGet(
    `/api/v1/metrics/customers/top-paying?limit=${encodeURIComponent(String(limit))}`,
  );
}

export async function getTopOutstanding(
  limit = 10,
): Promise<TopOutstandingResponse> {
  return apiGet(
    `/api/v1/metrics/customers/top-outstanding?limit=${encodeURIComponent(String(limit))}`,
  );
}

export async function getTopOverdueDebt(
  limit = 10,
): Promise<TopOverdueResponse> {
  return apiGet(
    `/api/v1/metrics/customers/top-overdue-debt?limit=${encodeURIComponent(String(limit))}`,
  );
}

export async function getBestOnTimePayers(
  limit = 10,
): Promise<BestOnTimeResponse> {
  return apiGet(
    `/api/v1/metrics/customers/best-on-time-payers?limit=${encodeURIComponent(String(limit))}`,
  );
}

export async function getPaymentsByMonth(): Promise<PaymentsByMonthResponse> {
  return apiGet("/api/v1/metrics/payments/by-month");
}

export async function getAllocationsSummary(): Promise<AllocationsSummaryResponse> {
  return apiGet("/api/v1/metrics/allocations/summary");
}

export async function postSync(body?: {
  local_file?: string;
}): Promise<SyncSuccessResponse> {
  const headers = new Headers(syncAuthHeaders());
  headers.set("Content-Type", "application/json");
  const res = await fetch(`${getBaseUrl()}/api/v1/sync`, {
    method: "POST",
    headers,
    body: JSON.stringify(body ?? {}),
  });
  const parsed = await parseJson<unknown>(res).catch(() => ({}));
  if (!res.ok) {
    throw new ApiRequestError("Sync failed", res.status, parsed);
  }
  return parsed as SyncSuccessResponse;
}

export async function askWarehouse(
  body: QaRequestBody,
): Promise<QaSuccessResponse> {
  const payload: Record<string, unknown> = { question: body.question };
  if (body.context?.length) {
    payload.context = trimWarehouseQaContext(body.context);
  }
  const res = await fetch(`${getBaseUrl()}/api/v1/qa`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  const parsed = await parseJson<unknown>(res).catch(() => ({}));
  if (!res.ok) {
    throw new ApiRequestError("Q&A failed", res.status, parsed);
  }
  return parsed as QaSuccessResponse;
}
