"use client"

import { useEffect, useState } from "react"
import { Banknote, Smartphone, CreditCard, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { useSearchParams } from "next/navigation"
import { format, startOfWeek, startOfMonth } from "date-fns"
import { cn } from "@/lib/utils"

export function PaymentBreakdown() {
  const searchParams = useSearchParams()
  const view = searchParams.get('view') || 'daily'
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [view])

  async function fetchStats() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = (supabase.from('transactions') as any).select('amount, payment_method, type, date').eq('user_id', user.id) // SECURITY

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

      const methods = [
        { name: "Cash", icon: Banknote, color: "text-emerald-600", bg: "bg-emerald-100" },
        { name: "UPI", icon: Smartphone, color: "text-orange-600", bg: "bg-orange-100" },
        { name: "Card", icon: CreditCard, color: "text-blue-600", bg: "bg-blue-100" },
      ]

      const processed = methods.map(m => {
        const txns = (data || []) as any[]
        const total = txns
          ?.filter(t => t.payment_method === m.name)
          .reduce((acc, curr) => acc + curr.amount, 0) || 0
        return { ...m, total }
      })

      setStats(processed)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="premium-card border-none bg-card h-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Payment Methods ({view})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : stats.every(s => s.total === 0) ? (
          <p className="text-center text-sm text-muted-foreground py-8">No data for this period</p>
        ) : (
          stats.map((m, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", m.bg, m.color)}>
                  <m.icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm">{m.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">₹{m.total.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Received/Spent</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
