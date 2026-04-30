import { cn } from "@/lib/utils";

export function ChartEmpty({
  label,
  square,
}: {
  label: string;
  square?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-muted/20 text-muted-foreground flex items-center justify-center rounded-xl border border-dashed border-border/70 px-4 text-center text-sm leading-relaxed",
        square
          ? "mx-auto aspect-square w-full max-w-[220px] min-h-0 text-xs"
          : "min-h-[168px] px-6",
      )}
    >
      {label}
    </div>
  );
}
