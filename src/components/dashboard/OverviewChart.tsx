"use client"

import { useEffect, useState } from "react"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { format, subDays, startOfMonth, eachDayOfInterval } from "date-fns"

export function OverviewChart() {
  const [data, setData] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const now = new Date()
    const thirtyDaysAgo = subDays(now, 30)

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, type, date')
      .eq('user_id', user.id) // SECURITY: Filter by user_id
      .gte('date', format(thirtyDaysAgo, 'yyyy-MM-dd'))
      .order('date', { ascending: true })

    if (transactions) {
      const txns = transactions as any[]
      // Create a map of dates for the last 30 days
      const dateRange = eachDayOfInterval({
        start: thirtyDaysAgo,
        end: now,
      })

      const chartData = dateRange.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const dayTransactions = txns.filter(t => t.date === dateStr)
        
        return {
          name: format(date, 'MMM dd'),
          income: dayTransactions
            .filter(t => t.type === 'income')
            .reduce((acc, curr) => acc + curr.amount, 0),
          expense: dayTransactions
            .filter(t => t.type === 'expense')
            .reduce((acc, curr) => acc + curr.amount, 0),
        }
      })

      setData(chartData)
    }
  }

  return (
    <Card className="premium-card lg:col-span-2 border-none bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Income vs Expense (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FDA4AF" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#FDA4AF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                minTickGap={30}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                }} 
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#FF6B00"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#income)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#FDA4AF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#expense)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
