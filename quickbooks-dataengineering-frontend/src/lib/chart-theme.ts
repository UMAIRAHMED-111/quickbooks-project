/** Shared Recharts styling — white plot, light grid, readable axes (FRONTEND.md §6). */
import { useThemeStore } from "@/store/theme";

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

export const tooltipContentStyle = {
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  fontSize: 12,
} as const;

export function useChartTheme() {
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const dark = resolvedTheme === "dark";
  return {
    chartGridColor: dark ? "#374151" : "#e5e7eb",
    axisTickStyle: dark
      ? ({ fill: "#9ca3af", fontSize: 10 } as const)
      : axisTickStyle,
    axisLabelStyle: dark
      ? ({ fill: "#d1d5db", fontSize: 12, fontWeight: 500 } as const)
      : axisLabelStyle,
    chartMonoScale: dark
      ? ({ ink: "#f9fafb", inkMuted: "#a78bfa", inkLight: "#c4b5fd" } as const)
      : chartMonoScale,
    chartDualMonochrome: dark
      ? ({ ink: "#f9fafb", inkMuted: "#a78bfa" } as const)
      : chartDualMonochrome,
    defaultChartMargin,
    tooltipContentStyle: dark
      ? ({
          borderRadius: 8,
          border: "1px solid #374151",
          backgroundColor: "#1f2937",
          color: "#f9fafb",
          fontSize: 12,
        } as const)
      : ({
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          fontSize: 12,
        } as const),
  };
}
