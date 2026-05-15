"use client"

import { useEffect, useState } from "react"
import { Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react"
import { StatCard } from "./StatCard"
import { createClient } from "@/utils/supabase/client"
import { useSearchParams } from "next/navigation"
import { format, startOfWeek, startOfMonth } from "date-fns"

export function DashboardStats() {
  const searchParams = useSearchParams()
  const view = searchParams.get("view") || "daily"
  const [stats, setStats] = useState({ balance: 0, income: 0, expenses: 0, profit: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [view])

  async function fetchStats() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let query = (supabase.from("transactions") as any)
      .select("amount, type, date")
      .eq("user_id", user.id)

    const now = new Date()
    if (view === "daily") {
      query = query.eq("date", format(now, "yyyy-MM-dd"))
    } else if (view === "weekly") {
      query = query.gte("date", format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"))
    } else if (view === "monthly") {
      query = query.gte("date", format(startOfMonth(now), "yyyy-MM-dd"))
    }

    const { data } = await query
    if (data) {
      const txns = data as any[]
      const income = txns.filter(t => t.type === "income").reduce((a, c) => a + c.amount, 0)
      const expenses = txns.filter(t => t.type === "expense").reduce((a, c) => a + c.amount, 0)
      setStats({ income, expenses, balance: income - expenses, profit: income - expenses })
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse border border-border border-l-4 border-l-muted" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Net Balance" amount={`₹${stats.balance.toLocaleString("en-IN")}`} trend="Overall" trendType="neutral" icon={Wallet} delay={0} />
      <StatCard title="Total Income" amount={`₹${stats.income.toLocaleString("en-IN")}`} trend="Inflow" trendType="up" icon={ArrowUpRight} delay={50} />
      <StatCard title="Total Expenses" amount={`₹${stats.expenses.toLocaleString("en-IN")}`} trend="Outflow" trendType="down" icon={ArrowDownLeft} delay={100} />
      <StatCard
        title="Net Profit / Loss"
        amount={`₹${Math.abs(stats.profit).toLocaleString("en-IN")}`}
        trend={stats.profit >= 0 ? "Profit" : "Loss"}
        trendType={stats.profit >= 0 ? "up" : "down"}
        icon={TrendingUp}
        delay={150}
      />
    </div>
  )
}
