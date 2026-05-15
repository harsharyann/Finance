"use client"

import { useEffect, useState } from "react"
import { 
  ArrowUpRight, 
  ArrowDownLeft,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"
import { format, startOfWeek, startOfMonth } from "date-fns"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export function RecentTransactions() {
  const searchParams = useSearchParams()
  const view = searchParams.get('view') || 'daily'
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchRecent()
  }, [view])

  async function fetchRecent() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id) // SECURITY: Filter by user_id
        .order('date', { ascending: false })
        .limit(10)
      
      const now = new Date()
      if (view === 'daily') {
        query = query.eq('date', format(now, 'yyyy-MM-dd'))
      } else if (view === 'weekly') {
        query = query.gte('date', format(startOfWeek(now), 'yyyy-MM-dd'))
      } else if (view === 'monthly') {
        query = query.gte('date', format(startOfMonth(now), 'yyyy-MM-dd'))
      }

      const { data, error } = await query
      
      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="premium-card border-none bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold">
          {view === 'daily' ? "Today's Activity" : "Recent Activity"}
        </CardTitle>
        <Link href="/transactions">
          <Button variant="ghost" size="sm" className="text-primary font-bold">View All</Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No activity for this period</p>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                t.type === 'income' ? "bg-orange-100 text-orange-600" : "bg-rose-100 text-rose-600"
              )}>
                {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{t.note || t.category}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(t.date), 'MMM dd')} • {t.category}
                </p>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-sm font-bold",
                  t.type === 'income' ? "text-orange-600" : "text-foreground"
                )}>
                  {t.type === 'income' ? "+" : "-"}₹{t.amount.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
