"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/utils/supabase/client"
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { FileDown, Printer, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MonthlyReport() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchReportData()
  }, [])

  async function fetchReportData() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const now = new Date()
      const firstDay = startOfMonth(now)
      const lastDay = endOfMonth(now)

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', format(firstDay, 'yyyy-MM-dd'))
        .lte('date', format(lastDay, 'yyyy-MM-dd'))
        .order('date', { ascending: false })

      if (error) throw error

      const txns = transactions || []
      const income = txns.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
      const expense = txns.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
      
      // Category Breakdown
      const categories: any = {}
      txns.forEach(t => {
        if (t.type === 'expense') {
          categories[t.category] = (categories[t.category] || 0) + t.amount
        }
      })

      setData({
        month: format(now, 'MMMM yyyy'),
        totalIncome: income,
        totalExpense: expense,
        netProfit: income - expense,
        transactions: txns,
        categories: Object.entries(categories).map(([name, amount]) => ({ name, amount }))
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) return <div>Loading report...</div>
  if (!data) return <div>No data found for this month.</div>

  return (
    <div className="space-y-8 print:p-0">
      {/* Report Header */}
      <div className="flex justify-between items-end pb-6 border-b">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Financial Report</h1>
          <p className="text-muted-foreground">{data.month}</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={handlePrint} className="rounded-xl gap-2">
            <Printer className="w-4 h-4" />
            Print PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="premium-card bg-emerald-500/10 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <TrendingUp className="text-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Total Income</span>
            </div>
            <p className="text-3xl font-black text-emerald-700">₹{data.totalIncome.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>

        <Card className="premium-card bg-rose-500/10 border-rose-500/20">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <TrendingDown className="text-rose-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600">Total Expense</span>
            </div>
            <p className="text-3xl font-black text-rose-700">₹{data.totalExpense.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>

        <Card className={cn(
          "premium-card",
          data.netProfit >= 0 ? "bg-primary/10 border-primary/20" : "bg-slate-500/10 border-slate-500/20"
        )}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-2">
              <Wallet className="text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Net Profit</span>
            </div>
            <p className="text-3xl font-black text-primary">₹{data.netProfit.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown Table */}
        <Card className="premium-card overflow-hidden border-none shadow-none bg-slate-50 dark:bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Expense by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.categories.map((cat: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-bold">{cat.name}</TableCell>
                    <TableCell className="text-right font-medium text-rose-600">₹{cat.amount.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Transactions */}
        <Card className="premium-card overflow-hidden border-none shadow-none bg-slate-50 dark:bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.transactions.slice(0, 8).map((t: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-2 border-b last:border-0 border-slate-200 dark:border-slate-800">
                  <div>
                    <p className="font-bold text-sm">{t.description}</p>
                    <p className="text-[10px] text-muted-foreground">{format(new Date(t.date), 'dd MMM yyyy')}</p>
                  </div>
                  <p className={cn(
                    "font-black text-sm",
                    t.type === 'income' ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer / Signature */}
      <div className="pt-12 text-center text-[10px] text-muted-foreground uppercase tracking-widest border-t">
        Generated by Finance — Powered by Sociusin on {format(new Date(), 'dd MMMM yyyy HH:mm')}
      </div>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
