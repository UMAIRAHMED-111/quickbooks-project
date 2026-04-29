import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { dashboardCardClass } from "@/lib/dashboard-styles"
import { cn } from "@/lib/utils"

export function KpiSkeleton() {
  return (
    <Card className={cn(dashboardCardClass)}>
      <CardHeader className="pb-2">
        <Skeleton className="h-3 w-24 rounded-md" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 rounded-md" />
      </CardContent>
    </Card>
  )
}
