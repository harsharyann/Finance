"use client"

import { useEffect, useState, Suspense } from "react"
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  Calendar, 
  Download,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Loader2
} from "lucide-react"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { useSearchParams } from "next/navigation"

function ReportsContent() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({
    savings: 0,
    avgDaily: 0,
    budgetAdherence: 0,
    breakdown: [],
    monthlyComp: []
  })
  const supabase = createClient()
  const searchParams = useSearchParams() // This triggers the need for Suspense

  useEffect(() => {
    fetchReportData()
  }, [])

  async function fetchReportData() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
      
      if (error) throw error
      if (!transactions) return

      const txns = transactions as any[]

      // Calculate Savings (Total Income - Total Expense)
      const income = txns.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
      const expense = txns.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
      const savings = income - expense

      // Avg Daily Expense (Last 30 days)
      const thirtyDaysAgo = subMonths(new Date(), 1)
      const last30Days = txns.filter(t => new Date(t.date) > thirtyDaysAgo && t.type === 'expense')
      const avgDaily = last30Days.reduce((acc, t) => acc + t.amount, 0) / 30

      // Breakdown by Category
      const catMap: any = {}
      txns.filter(t => t.type === 'expense').forEach(t => {
        catMap[t.category] = (catMap[t.category] || 0) + t.amount
      })
      const breakdown = Object.entries(catMap).map(([name, amount]: any) => ({
        name,
        amount,
        percent: expense > 0 ? (amount / expense) * 100 : 0,
        color: name === 'Shop Stock' ? 'bg-primary' : name === 'Food' ? 'bg-rose-500' : 'bg-amber-500'
      })).sort((a, b) => b.amount - a.amount)

      // Monthly Comparison (Last 3 months)
      const monthlyComp = [0, 1, 2].map(i => {
        const date = subMonths(new Date(), i)
        const start = startOfMonth(date)
        const end = endOfMonth(date)
        const monthTxns = txns.filter(t => {
          const d = new Date(t.date)
          return d >= start && d <= end
        })
        return {
          month: format(date, 'MMM yyyy'),
          income: monthTxns.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
          expense: monthTxns.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
        }
      })

      setStats({
        savings,
        avgDaily,
        budgetAdherence: 95,
        breakdown,
        monthlyComp
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Reports</h2>
          <p className="text-muted-foreground">Deep dive into your spending habits and income growth.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl gap-2 bg-white">
            <Calendar className="w-4 h-4" />
            {format(new Date(), 'MMM yyyy')}
          </Button>
          <Button className="rounded-xl gap-2">
            <Download className="w-4 h-4" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6 bg-white">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                 <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold">Total Savings</h3>
           </div>
           <p className="text-3xl font-bold mb-1">₹{stats.savings.toLocaleString('en-IN')}</p>
           <p className="text-sm text-emerald-600 font-medium">All time accumulated</p>
        </div>

        <div className="premium-card p-6 bg-white">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                 <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="font-bold">Avg. Daily Expense</h3>
           </div>
           <p className="text-3xl font-bold mb-1">₹{Math.round(stats.avgDaily).toLocaleString('en-IN')}</p>
           <p className="text-sm text-rose-600 font-medium">Based on last 30 days</p>
        </div>

        <div className="premium-card p-6 bg-white">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                 <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold">Budget Status</h3>
           </div>
           <p className="text-3xl font-bold mb-1">{stats.budgetAdherence}%</p>
           <p className="text-sm text-muted-foreground font-medium">Health score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="premium-card border-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
               <CardTitle className="text-lg font-bold">Expense Breakdown</CardTitle>
               <PieChartIcon className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-6">
               {stats.breakdown.length === 0 ? (
                 <p className="text-center py-10 text-muted-foreground">No expense data available</p>
               ) : stats.breakdown.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-4">
                     <div className={cn("w-3 h-3 rounded-full", item.color || 'bg-slate-300')}></div>
                     <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-sm font-bold">{item.name}</span>
                           <span className="text-sm font-bold">₹{item.amount.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className={cn("h-full", item.color || 'bg-slate-300')} style={{ width: `${item.percent}%` }}></div>
                        </div>
                     </div>
                  </div>
               ))}
            </CardContent>
         </Card>

         <Card className="premium-card border-none bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
               <CardTitle className="text-lg font-bold">Monthly Comparison</CardTitle>
               <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div className="space-y-8">
                  {stats.monthlyComp.map((m: any, i: number) => (
                    <div key={i} className="space-y-3">
                       <p className="text-sm font-bold text-muted-foreground">{m.month}</p>
                       <div className="flex gap-4">
                          <div className="flex-1 space-y-1">
                             <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold">
                                <span>Income</span>
                                <span>₹{m.income.toLocaleString()}</span>
                             </div>
                             <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: m.income > 0 ? '100%' : '0%' }}></div>
                             </div>
                          </div>
                          <div className="flex-1 space-y-1">
                             <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold">
                                <span>Expense</span>
                                <span>₹{m.expense.toLocaleString()}</span>
                             </div>
                             <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-400" style={{ width: m.income > 0 ? `${(m.expense/m.income)*100}%` : (m.expense > 0 ? '100%' : '0%') }}></div>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
        <ReportsContent />
      </Suspense>
    </AppLayout>
  )
}
