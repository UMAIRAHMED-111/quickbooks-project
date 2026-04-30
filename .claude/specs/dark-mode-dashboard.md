# Feature: Dark Mode Dashboard

**Status:** Draft  
**Created:** 2026-04-30

## Problem
The dashboard only supports light mode. Users working in low-light environments or who prefer dark UIs have no way to switch themes. The CSS infrastructure (`index.css` `.dark` class, `@custom-variant dark`) is already in place but nothing wires it up.

## Goal
Add a persistent light/dark toggle to the dashboard header that switches the entire UI — including Recharts — using the existing React provider pattern, with no new state management libraries.

## Acceptance Criteria
- [ ] A Sun/Moon toggle button appears in the `AppShell` header, right of the "Refresh data" button
- [ ] Clicking the button switches the full UI (background, cards, nav, inputs) to dark mode using the `.dark` class on `<html>`
- [ ] Theme choice persists across page reloads via `localStorage` key `"qbo-theme"`
- [ ] On first load, `"system"` is the default — respects `prefers-color-scheme`
- [ ] All 10 Recharts chart components render with dark-aware grid, axis, and tooltip colors in dark mode
- [ ] `npm run build && npm run lint` passes clean with zero type errors

## Technical Approach

### Files to change
- `src/context/ThemeContext.tsx` *(new)* — `ThemeProvider` component + `useTheme()` hook; manages `"light" | "dark" | "system"` state, writes to `localStorage`, applies `.dark` class to `document.documentElement`
- `src/app/providers.tsx` — wrap children with `<ThemeProvider>` inside existing `Providers`
- `src/components/layout/AppShell.tsx` — import `useTheme`, add `Sun`/`Moon` icon toggle button in header
- `src/lib/chart-theme.ts` — add dark variant constants (`chartGridColorDark`, `axisTickStyleDark`) and export `useChartTheme()` hook that returns the right set based on `useTheme()`
- All 10 chart components in `src/components/charts/` — replace direct imports of `chartGridColor`, `axisTickStyle`, `axisLabelStyle` with destructured result of `useChartTheme()`

### New modules / migrations needed
- `src/context/ThemeContext.tsx` — new file

### API contract (if applicable)
None — purely frontend, no backend changes.

### Data model changes (if applicable)
None.

### AI / LLM considerations (if applicable)
None.

## Implementation Details

### ThemeContext shape
```ts
type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark"; // system resolved to actual value
  setTheme: (t: Theme) => void;
}
```

### Dark mode activation
```ts
// On mount and on theme change:
const isDark =
  theme === "dark" ||
  (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
document.documentElement.classList.toggle("dark", isDark);
```
Listen to `window.matchMedia("(prefers-color-scheme: dark)")` change event when `theme === "system"`.

### useChartTheme()
```ts
export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  return {
    chartGridColor: dark ? "#374151" : "#e5e7eb",
    axisTickStyle: dark ? { fill: "#9ca3af", fontSize: 10 } : axisTickStyle,
    axisLabelStyle: dark ? { fill: "#d1d5db", fontSize: 12, fontWeight: 500 } : axisLabelStyle,
    chartMonoScale: dark
      ? { ink: "#f9fafb", inkMuted: "#a78bfa", inkLight: "#c4b5fd" }
      : chartMonoScale,
    chartDualMonochrome: dark ? { ink: "#f9fafb", inkMuted: "#a78bfa" } : chartDualMonochrome,
    defaultChartMargin,
  };
}
```

### Toggle button placement (AppShell.tsx)
Add between the nav branding block and the Refresh button:
```tsx
<Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
  {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
</Button>
```

## Test Plan
- [ ] Toggle switches UI to dark — background becomes dark, cards and text invert
- [ ] Reload at dark → UI loads dark (localStorage persisted)
- [ ] System preference: set OS to dark, reload with no localStorage key → loads dark
- [ ] Charts in dark mode: grid lines visible against dark background, axis labels readable
- [ ] Toggle back to light from dark — all UI and charts revert cleanly
- [ ] `npm run build && npm run lint` passes clean

## Risks & Edge Cases
- **SSR / flash of wrong theme**: Not an issue — Vite SPA, no SSR. Script injection not needed.
- **Recharts tooltip background**: The `contentStyle` in chart tooltips also uses hardcoded colors. `useChartTheme()` must include `tooltipContentStyle` to prevent a white box on dark backgrounds.

## Out of Scope
- Three-way system/light/dark picker UI (cycle button is sufficient)
- Per-page or per-widget theme granularity
- Backend or API changes
