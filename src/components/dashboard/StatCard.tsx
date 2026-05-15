import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  amount: string
  trend?: string
  trendType?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  className?: string
}

export function StatCard({ title, amount, trend, trendType = 'neutral', icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn("premium-card border-none shadow-sm", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <span className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              trendType === 'up' ? "bg-emerald-100 text-emerald-600" : 
              trendType === 'down' ? "bg-rose-100 text-rose-600" : 
              "bg-slate-100 text-slate-600"
            )}>
              {trend}
            </span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight">{amount}</h3>
        </div>
      </CardContent>
    </Card>
  )
}
