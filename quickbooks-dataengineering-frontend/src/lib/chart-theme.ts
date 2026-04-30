/** Shared Recharts styling — white plot, light grid, readable axes (FRONTEND.md §6). */

/** Legacy categorical palette (prefer chartMonoScale for new work). */
export const chartPalette = {
  primary: "#2563eb",
  secondary: "#0d9488",
  tertiary: "#ea580c",
  quaternary: "#7c3aed",
  muted: "#64748b",
  success: "#16a34a",
  danger: "#dc2626",
} as const;

/** Primary data ink (near black). */
const ink = "#0a0a0a";
/**
 * Dark purple — second tone, aligned with favicon (`#7e14ff` / `#863bff`).
 */
const inkMuted = "#5c1fa3";
/**
 * Lighter violet for tertiary series / secondary lines (still on-brand).
 */
const inkLight = "#8f6bdc";

/**
 * Black + favicon-adjacent purples for multi-series charts.
 */
export const chartMonoScale = {
  ink,
  inkMuted,
  inkLight,
} as const;

/** Binary splits (2 bars / 2 slices). */
export const chartDualMonochrome = {
  ink,
  inkMuted,
} as const;

export const chartGridColor = "#e5e7eb";

export const defaultChartMargin = { top: 4, right: 8, left: 2, bottom: 4 };

export const axisTickStyle = {
  fill: "#404040",
  fontSize: 10,
} as const;

export const axisLabelStyle = {
  fill: "#525252",
  fontSize: 12,
  fontWeight: 500,
} as const;
