"use client"

import { useEffect, useState } from "react"
import { TrendingUp, ArrowRight, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"
import { useSearchParams } from "next/navigation"
import { format, startOfWeek, startOfMonth } from "date-fns"

export function SpendingAnalysis() {
  const searchParams = useSearchParams()
  const view = searchParams.get('view') || 'daily'
  const [loading, setLoading] = useState(true)
  const [topCategories, setTopCategories] = useState<any[]>([])
  const [health, setHealth] = useState({ status: "Good", message: "" })
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [view])

  async function fetchData() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase.from('transactions').select('*').eq('user_id', user.id) // SECURITY
      
      const now = new Date()
      if (view === 'daily') {
        query = query.eq('date', format(now, 'yyyy-MM-dd'))
      } else if (view === 'weekly') {
        query = query.gte('date', format(startOfWeek(now), 'yyyy-MM-dd'))
      } else if (view === 'monthly') {
        query = query.gte('date', format(startOfMonth(now), 'yyyy-MM-dd'))
      }

      const { data: transactions, error } = await query
      
      if (error) throw error
      const txns = (transactions || []) as any[]
      if (txns.length === 0) {
        setTopCategories([])
        setHealth({ status: "N/A", message: "No data for this period" })
        setLoading(false)
        return
      }

      // Process Categories
      const catMap: any = {}
      const totalExpense = txns
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0)

      txns
        .filter(t => t.type === 'expense')
        .forEach(t => {
          catMap[t.category] = (catMap[t.category] || 0) + t.amount
        })

      const sortedCats = Object.entries(catMap)
        .map(([name, amount]: any) => ({
          name,
          amount,
          percent: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3)

      setTopCategories(sortedCats)

      // Financial Health Calculation
      const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
      const savingsRate = income > 0 ? ((income - totalExpense) / income) * 100 : 0
      
      let status = "Excellent"
      let message = "You're saving a healthy portion of your income."
      
      if (income === 0 && totalExpense > 0) {
        status = "Negative"
        message = "You have expenses but no income recorded yet."
      } else if (savingsRate < 10) {
        status = "Needs Attention"
        message = "Your expenses are close to your income. Try to cut back."
      } else if (savingsRate < 25) {
        status = "Good"
        message = "You're maintaining a steady balance."
      }

      setHealth({ status, message: income > 0 ? `Your savings rate is ${Math.round(savingsRate)}%` : message })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="premium-card border-none bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Spending Analysis ({view})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : topCategories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No spending recorded for this period</p>
        ) : (
          topCategories.map((cat, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">{cat.name}</span>
                <span className="text-sm font-bold">₹{cat.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    i === 0 ? "bg-primary" : i === 1 ? "bg-orange-400" : "bg-rose-400"
                  )} 
                  style={{ width: `${cat.percent}%` }}
                ></div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
