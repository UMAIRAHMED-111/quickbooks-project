export function formatCurrency(
  value: number,
  opts?: { compact?: boolean }
): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: opts?.compact ? 1 : 2,
    notation: opts?.compact ? "compact" : "standard",
  }).format(value)
}

export function formatInteger(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value)
}

export function truncateLabel(s: string, max = 28): string {
  if (s.length <= max) return s
  return `${s.slice(0, max - 1)}…`
}
