"use client"

import { useEffect, useState, useMemo } from "react"
import { createClient } from "@/utils/supabase/client"
import { format, subDays, startOfDay, endOfDay, isSameDay } from "date-fns"
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  ChevronRight, 
  ChevronLeft,
  Search,
  Wallet
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function DailyReport() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await (supabase.from('transactions') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      toast.error("Failed to load daily data")
    } finally {
      setLoading(false)
    }
  }

  // Group transactions by date
  const dailyGroups = useMemo(() => {
    const groups: Record<string, any> = {}
    
    transactions.forEach(t => {
      const dateStr = t.date
      if (!groups[dateStr]) {
        groups[dateStr] = {
          date: dateStr,
          income: 0,
          expense: 0,
          txns: []
        }
      }
      
      if (t.type === 'income') groups[dateStr].income += Number(t.amount)
      else groups[dateStr].expense += Number(t.amount)
      
      groups[dateStr].txns.push(t)
    })

    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions])

  const filteredGroups = dailyGroups.filter(g => 
    !search || format(new Date(g.date), 'PPPP').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary/20" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in-fade">
      
      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text"
          placeholder="Search by date (e.g. 15 May)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-12 pl-11 pr-4 rounded-2xl border bg-card text-sm focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      <div className="grid gap-6">
        {filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-[2.5rem] border-2 border-dashed">
            <Calendar className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <p className="text-lg font-black text-foreground">No records found</p>
          </div>
        ) : (
          filteredGroups.map((group, idx) => (
            <div 
              key={group.date} 
              className="bg-card border rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all animate-in-slide-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* DATE HEADER */}
              <div className="px-8 py-6 bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground">{format(new Date(group.date), 'dd MMMM yyyy')}</h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                      {isSameDay(new Date(group.date), new Date()) ? "Today's Summary" : format(new Date(group.date), 'EEEE')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 bg-background/50 backdrop-blur-sm p-3 px-5 rounded-2xl border shadow-sm">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">In</p>
                    <p className="text-base font-black text-emerald-600">₹{group.income.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-right">
                    <p className="text-[10px] font-black text-rose-600/60 uppercase tracking-widest">Out</p>
                    <p className="text-base font-black text-rose-600">₹{group.expense.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-right">
                    <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Net</p>
                    <p className={cn("text-base font-black", (group.income - group.expense) >= 0 ? "text-primary" : "text-rose-600")}>
                      ₹{(group.income - group.expense).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* TRANSACTIONS LIST */}
              <div className="p-4 sm:p-8">
                <div className="space-y-1">
                  {group.txns.map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between p-3.5 hover:bg-muted/30 rounded-2xl transition-all group border border-transparent hover:border-border">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          t.type === 'income' ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                        )}>
                          {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground">{t.note || t.category}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{t.category} • {t.payment_method}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-black tabular-nums",
                          t.type === 'income' ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {t.type === 'income' ? "+" : "-"}₹{Number(t.amount).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
