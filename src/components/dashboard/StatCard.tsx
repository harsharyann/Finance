import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatCardProps {
  title: string
  amount: string
  trend?: string
  trendType?: "up" | "down" | "neutral"
  icon: LucideIcon
  className?: string
  delay?: number
}

export function StatCard({ title, amount, trend, trendType = "neutral", icon: Icon, className, delay = 0 }: StatCardProps) {
  const accentColor =
    trendType === "up" ? "border-l-emerald-500" :
    trendType === "down" ? "border-l-rose-500" :
    "border-l-primary"

  const amountColor =
    trendType === "up" ? "text-emerald-600 dark:text-emerald-400" :
    trendType === "down" ? "text-rose-600 dark:text-rose-400" :
    "text-foreground"

  const TrendIcon = trendType === "up" ? TrendingUp : trendType === "down" ? TrendingDown : Minus

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-2xl p-5 border-l-4 shadow-sm hover:shadow-md transition-all duration-200 animate-in-fade",
        accentColor,
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center",
          trendType === "up" ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" :
          trendType === "down" ? "bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400" :
          "bg-primary/10 text-primary"
        )}>
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg",
            trendType === "up" ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" :
            trendType === "down" ? "bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400" :
            "bg-muted text-muted-foreground"
          )}>
            <TrendIcon className="w-2.5 h-2.5" />
            {trend}
          </div>
        )}
      </div>

      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
      <h3 className={cn("text-2xl font-heading font-black tracking-tight tabular-nums", amountColor)}>
        {amount}
      </h3>
    </div>
  )
}
