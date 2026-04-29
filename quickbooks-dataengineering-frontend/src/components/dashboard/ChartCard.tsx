import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { dashboardCardClass } from "@/lib/dashboard-styles"
import { cn } from "@/lib/utils"
import { BlockError } from "./BlockError"

export function ChartCard({
  title,
  description,
  loading,
  error,
  className,
  children,
  compact,
  skeletonSquare,
}: {
  title: string
  description: string
  loading: boolean
  error: unknown
  className?: string
  children: ReactNode
  compact?: boolean
  skeletonSquare?: boolean
}) {
  return (
    <Card className={cn(dashboardCardClass, "h-full", compact && "gap-3 py-3", className)}>
      <CardHeader className={cn(compact ? "gap-0.5 px-4 pb-2 pt-0" : "pb-3")}>
        <CardTitle
          className={cn("font-semibold tracking-tight", compact ? "text-sm" : "text-base")}
        >
          {title}
        </CardTitle>
        <CardDescription
          className={cn(compact ? "line-clamp-2 text-xs leading-snug" : "text-sm leading-relaxed")}
        >
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-3", compact ? "px-4 pb-3 pt-0" : "pt-0")}>
        {loading ? (
          skeletonSquare ? (
            <Skeleton className="mx-auto aspect-square w-full max-w-[220px] rounded-xl" />
          ) : (
            <Skeleton className="h-[200px] w-full rounded-xl" />
          )
        ) : error ? (
          <BlockError error={error} />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
