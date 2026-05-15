"use client"

import { useEffect, useState } from "react"
import { Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react"
import { StatCard } from "./StatCard"
import { createClient } from "@/utils/supabase/client"
import { useSearchParams } from "next/navigation"
import { format, startOfDay, startOfWeek, startOfMonth } from "date-fns"

export function DashboardStats() {
  const searchParams = useSearchParams()
  const view = searchParams.get('view') || 'daily'
  const [stats, setStats] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    profit: 0
  })
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [view])

  async function fetchStats() {
    // Get current user first
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let query = supabase
      .from('transactions')
      .select('amount, type, date')
      .eq('user_id', user.id) // SECURITY: Filter by user_id

    const now = new Date()
    if (view === 'daily') {
      query = query.eq('date', format(now, 'yyyy-MM-dd'))
    } else if (view === 'weekly') {
      query = query.gte('date', format(startOfWeek(now), 'yyyy-MM-dd'))
    } else if (view === 'monthly') {
      query = query.gte('date', format(startOfMonth(now), 'yyyy-MM-dd'))
    }

    const { data, error } = await query

    if (data) {
      const txns = data as any[]
      const income = txns
        .filter(t => t.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0)
      
      const expenses = txns
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0)

      setStats({
        income,
        expenses,
        balance: income - expenses,
        profit: income - expenses
      })
    }
  }

  const titleMap: any = {
    daily: "Today's Overview",
    weekly: "This Week's Overview",
    monthly: "This Month's Overview"
  }

  return (
    <div className="space-y-6 animate-in-fade">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] font-heading">
          {titleMap[view] || titleMap.daily}
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Live Insights</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Balance" 
          amount={`₹${stats.balance.toLocaleString('en-IN')}`} 
          trend={`Net for ${view}`} 
          trendType="neutral"
          icon={Wallet}
        />
        <StatCard 
          title="Total Income" 
          amount={`₹${stats.income.toLocaleString('en-IN')}`} 
          trend={`Inflow ${view}`} 
          trendType="up"
          icon={ArrowUpRight}
        />
        <StatCard 
          title="Total Expenses" 
          amount={`₹${stats.expenses.toLocaleString('en-IN')}`} 
          trend={`Outflow ${view}`} 
          trendType="down"
          icon={ArrowDownLeft}
        />
        <StatCard 
          title="Net Profit/Loss" 
          amount={`₹${stats.profit.toLocaleString('en-IN')}`} 
          trend="Business Health" 
          trendType={stats.profit >= 0 ? "up" : "down"}
          icon={TrendingUp}
          className={stats.profit >= 0 ? "bg-emerald-50/50" : "bg-rose-50/50"}
        />
      </div>
    </div>
  )
}
