"use client"

import { useEffect, useState } from "react"
import { Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react"
import { StatCard } from "./StatCard"
import { createClient } from "@/utils/supabase/client"
import { useSearchParams } from "next/navigation"
import { format, startOfWeek, startOfMonth, endOfDay, startOfDay } from "date-fns"

export function DashboardStats() {
  const searchParams = useSearchParams()
  const view = searchParams.get("view") || "daily"
  const [stats, setStats] = useState({ balance: 0, income: 0, expenses: 0, profit: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  async function fetchStats() {
    setLoading(true)
    setError("")

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const now = new Date()
      const todayStr = format(now, "yyyy-MM-dd")
      const weekStartStr = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd")
      const monthStartStr = format(startOfMonth(now), "yyyy-MM-dd")

      // Use .gte() + .lte() for daily too — avoids timestamp vs date mismatch
      let fromDate: string
      let toDate: string = todayStr // always up to today

      if (view === "daily") {
        fromDate = todayStr
      } else if (view === "weekly") {
        fromDate = weekStartStr
      } else if (view === "monthly") {
        fromDate = monthStartStr
      } else {
        fromDate = todayStr
      }

      const { data, error: fetchError } = await (supabase
        .from("transactions") as any)
        .select("amount, type")
        .eq("user_id", user.id)
        .gte("date", fromDate)
        .lte("date", toDate)

      if (fetchError) {
        console.error("DashboardStats fetch error:", fetchError)
        setError(fetchError.message)
        setLoading(false)
        return
      }

      const txns = (data || []) as any[]
      const income = txns
        .filter(t => t.type === "income")
        .reduce((a, c) => a + Number(c.amount), 0)
      const expenses = txns
        .filter(t => t.type === "expense")
        .reduce((a, c) => a + Number(c.amount), 0)

      setStats({
        income,
        expenses,
        balance: income - expenses,
        profit: income - expenses,
      })
    } catch (e: any) {
      console.error("DashboardStats error:", e)
      setError(e?.message || "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse border border-border border-l-4 border-l-muted" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-sm text-destructive font-medium">
        Failed to load stats: {error}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Net Balance"
        amount={`₹${stats.balance.toLocaleString("en-IN")}`}
        trend="Overall"
        trendType="neutral"
        icon={Wallet}
        delay={0}
      />
      <StatCard
        title="Total Income"
        amount={`₹${stats.income.toLocaleString("en-IN")}`}
        trend="Inflow"
        trendType="up"
        icon={ArrowUpRight}
        delay={50}
      />
      <StatCard
        title="Total Expenses"
        amount={`₹${stats.expenses.toLocaleString("en-IN")}`}
        trend="Outflow"
        trendType="down"
        icon={ArrowDownLeft}
        delay={100}
      />
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
