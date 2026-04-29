import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { dashboardCardClass } from "@/lib/dashboard-styles"
import { cn } from "@/lib/utils"

export function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <Card
      className={cn(
        dashboardCardClass,
        "group transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      )}
    >
      <CardHeader className="pb-1">
        <CardDescription className="text-muted-foreground text-[0.7rem] font-semibold tracking-wide uppercase">
          {label}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-foreground text-lg font-semibold tabular-nums tracking-tight md:text-xl">
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
