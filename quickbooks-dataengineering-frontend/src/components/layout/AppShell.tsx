import { FileText, LayoutDashboard, Loader2, RefreshCw, TrendingUp, Users } from "lucide-react"
import { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { toast } from "sonner"
import { WarehouseChatWidget } from "@/features/dashboard/WarehouseChatWidget"
import { useSyncMutation } from "@/features/dashboard/hooks/useMetrics"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/errorCodes"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/invoices", label: "Invoices", icon: FileText, end: false },
  { to: "/customers", label: "Customers", icon: Users, end: false },
  { to: "/trends", label: "Trends", icon: TrendingUp, end: false },
]

export function AppShell() {
  const sync = useSyncMutation()
  const [dataEpoch, setDataEpoch] = useState(0)

  const handleRefresh = () => {
    sync.mutate(undefined, {
      onSuccess: () => {
        toast.success("Warehouse refreshed. Metrics updated.")
        setDataEpoch((n) => n + 1)
      },
      onError: (e) => {
        toast.error(getErrorMessage(e))
      },
    })
  }

  return (
    <div className="bg-muted/40 min-h-screen">
      <header className="border-border/60 bg-background/95 sticky top-0 z-40 border-b shadow-[0_1px_0_rgba(0,0,0,0.03)] backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex items-center justify-between gap-4 py-4">
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
              disabled={sync.isPending}
              data-loading={sync.isPending ? true : undefined}
              aria-busy={sync.isPending}
              aria-label={sync.isPending ? "Refreshing warehouse data" : "Refresh warehouse data"}
              onClick={handleRefresh}
              className={cn(
                "min-h-10 min-w-[158px] shrink-0 gap-2 px-4 font-semibold",
                sync.isPending && "shadow-inner ring-2 ring-primary-foreground/20"
              )}
            >
              {sync.isPending ? (
                <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="size-4 shrink-0" aria-hidden />
              )}
              <span className="tabular-nums">
                {sync.isPending ? "Refreshing…" : "Refresh data"}
              </span>
            </Button>
          </div>

          <nav
            className="scrollbar-none -mb-px flex gap-1 overflow-x-auto"
            aria-label="Main navigation"
          >
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "border-primary text-foreground font-medium"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )
                }
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <Outlet />
      </main>

      <WarehouseChatWidget dataEpoch={dataEpoch} />
    </div>
  )
}
