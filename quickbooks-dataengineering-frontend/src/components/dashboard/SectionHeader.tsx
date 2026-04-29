export function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-border/70 max-w-3xl border-l-2 border-l-primary/40 pl-4 md:pl-5">
      <h2 className="text-foreground text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
