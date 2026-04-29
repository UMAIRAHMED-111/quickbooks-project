export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background/80 border-border/50 rounded-xl border px-3.5 py-3 shadow-sm">
      <dt className="text-muted-foreground text-[0.7rem] font-semibold tracking-wide uppercase">
        {label}
      </dt>
      <dd className="text-foreground mt-1 text-base font-semibold tabular-nums">{value}</dd>
    </div>
  )
}
