import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AppShellProps = {
  children: React.ReactNode
  onRefresh: () => void
  isRefreshing: boolean
}

export function AppShell({ children, onRefresh, isRefreshing }: AppShellProps) {
  return (
    <div className="bg-muted/40 min-h-screen">
      <header className="border-border/60 bg-background/95 sticky top-0 z-40 border-b shadow-[0_1px_0_rgba(0,0,0,0.03)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="min-w-0">
            <p className="text-muted-foreground text-[0.65rem] font-semibold tracking-[0.2em] uppercase">
              Warehouse
            </p>
            <h1 className="text-foreground truncate text-lg font-semibold tracking-tight md:text-xl">
              QBO Analytics
            </h1>
            <p className="text-muted-foreground mt-0.5 hidden text-xs sm:block">
              QuickBooks snapshot · internal dashboard
            </p>
          </div>
          <Button
            type="button"
            variant="default"
            size="lg"
            disabled={isRefreshing}
            data-loading={isRefreshing ? true : undefined}
            aria-busy={isRefreshing}
            aria-label={isRefreshing ? "Refreshing warehouse data" : "Refresh warehouse data"}
            onClick={onRefresh}
            className={cn(
              "min-h-10 min-w-[158px] shrink-0 gap-2 px-4 font-semibold",
              isRefreshing && "shadow-inner ring-2 ring-primary-foreground/20"
            )}
          >
            {isRefreshing ? (
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="size-4 shrink-0" aria-hidden />
            )}
            <span className="tabular-nums">{isRefreshing ? "Refreshing…" : "Refresh data"}</span>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">{children}</main>
    </div>
  )
}
